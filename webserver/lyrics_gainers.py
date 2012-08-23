import re
from urllib import urlencode
from urlparse import urljoin
from twisted.internet import reactor, protocol
from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage
from BeautifulSoup import BeautifulSoup, SoupStrainer, Comment
from unidecode import unidecode
from txredis.protocol import Redis


class LyricsNotFound(Exception):
    pass


class LyricsGainer(object):
    def __init__(self, artist, track):
        self.artist = artist
        self.track = track

    @inlineCallbacks
    def get(self):
        lyrics = yield self.getLyricsFromCache()
        if lyrics:
            returnValue(lyrics)
        for source in self.SOURCES:
            try:
                lyrics = yield self.getLyricsFromSource(source)
                yield self.saveLyricsToCache(lyrics)
                returnValue(lyrics)
            except Exception:
                pass
        raise LyricsNotFound('All sources gave no lyrics')

    @property
    def SOURCES(self):
        return [
            LyricsWikiaComLyricsGainer,
            AZLyricsLyricsGainer,
        ]

    @inlineCallbacks
    def getLyricsFromCache(self):
        try:
            lyrics = yield self.getLyricsCacheManager().get()
            returnValue(lyrics)
        except Exception:
            returnValue(None)

    @inlineCallbacks
    def saveLyricsToCache(self, lyrics):
        try:
            yield self.getLyricsCacheManager().set(lyrics)
        except Exception:
            pass

    def getLyricsCacheManager(self):
        return LyricsCacheManager(self.artist, self.track)

    @inlineCallbacks
    def getLyricsFromSource(self, source):
        lyrics = yield source(self.artist, self.track).get()
        returnValue(lyrics)


class LyricsCacheManager(object):
    def __init__(self, artist, track, host='localhost', port=6379):
        self.artist = artist
        self.track = track
        self.host = host
        self.port = port

    @inlineCallbacks
    def get(self):
        connection = yield self._getConnection()
        lyrics = yield connection.get(self._constructCacheKey())
        returnValue(lyrics)

    @inlineCallbacks
    def set(self, value):
        connection = yield self._getConnection()
        yield connection.set(self._constructCacheKey(), value)

    @inlineCallbacks
    def _getConnection(self):
        clientCreator = protocol.ClientCreator(reactor, Redis)
        redis = yield clientCreator.connectTCP(self.host, self.port)
        returnValue(redis)

    def _constructCacheKey(self):
        return '{artist}:{track}'.format(**self.__dict__)


class BaseSiteLyricsGainer(LyricsGainer):
    RE_HTML_TAG = re.compile(r'<.*?>')

    def get(self):
        raise NotImplementedError()

    @classmethod
    def _getSoup(self, data, el, attrdict):
        soup = BeautifulSoup(data,
            convertEntities=BeautifulSoup.ALL_ENTITIES,
            parseOnlyThese=SoupStrainer(el, attrdict)
        )
        return soup.find(el, attrdict).extract()

    def _excludeFromSoup(self, soup, *attrDicts):
        for d in attrDicts:
            [el.extract() for el in soup.findAll(**d)]
        return soup

    def _getPartOfStringBetweenTwoSubstrings(self, string, beginSubstring, endSubstring):
        beginIndex = string.find(beginSubstring) + len(beginSubstring)
        endIndex = string.find(endSubstring)
        return string[beginIndex:endIndex]

    def _removeHtmlTags(self, string):
        return self.RE_HTML_TAG.sub('', string)

    def _isLyricsBlank(self, lyrics):
        return not bool(lyrics.strip())


class LyricsWikiaComLyricsGainer(BaseSiteLyricsGainer):
    base_url = 'http://lyrics.wikia.com'

    @inlineCallbacks
    def get(self):
        apiResponse = yield getPage(self._getApiResponseUrl())
        lyricsPageUrl = self._extractUrlFromApiResponse(apiResponse)
        try:
            lyricsPage = yield getPage(lyricsPageUrl)
        except Exception, e:
            # For some reasons, twisted treats redirects as 404 response
            # Luckily, exception contains all the page text,
            # so we can grab it from here
            # TODO: This is a dirty hack
            # we need to figure out how to handle redirects properly in future.
            lyricsPage = e.response
        lyrics = self._parseLyricsPage(lyricsPage)
        if self._isLyricsBlank(lyrics):
            raise LyricsNotFound('Empty lyrics')
        returnValue(lyrics)

    def _getApiResponseUrl(self):
        query = urlencode(dict(
            func = 'getSong',
            fmt = 'xml',
            artist = self.artist,
            song = self.track
        ))
        return '%s/api.php?%s' % (self.base_url, query)

    def _extractUrlFromApiResponse(self, response):
        xml = BeautifulSoup(response)
        if xml.find('lyrics').text == 'Not found':
            raise LyricsNotFound()
        url = xml.find('url').text
        return str(url)

    def _parseLyricsPage(self, page):
        soup = self._getSoup(page, 'div', {'class':'lyricbox'})
        if self._isSoupContainsCopyrightError(soup):
            raise LyricsNotFound('Copyright error')
        self._excludeFromSoup(soup,
            {'name':'p'},
            {'name':'div', 'attrs': {'class':'rtMatcher'}},
            {'text':lambda text:isinstance(text, Comment)}
        )
        lyrics = ''.join(map(lambda s: s if isinstance(s, unicode) else '\n', soup))
        return lyrics

    def _isSoupContainsCopyrightError(self, soup):
        i = soup.find('i')
        if not i:
            return False
        return i.text.startswith('Unfortunately, ')


class AZLyricsLyricsGainer(BaseSiteLyricsGainer):
    base_url = 'http://www.azlyrics.com/lyrics'

    @inlineCallbacks
    def get(self):
        lyricsPage = yield getPage(self._getLyricsPageUrl())
        returnValue(self._extractLyricsFromPage(lyricsPage))

    def _getLyricsPageUrl(self):
        return '%s/%s/%s.html' %(
            self.base_url,
            self._transform(self.artist),
            self._transform(self.track),
        )

    def  _transform(self, string):
        unicode_string = unicode(string, 'utf-8')
        unicode_string = self._transform_umlauts_to_ascii(unicode_string)
        unicode_string = unicode_string.replace('&', 'and')
        unicode_string = re.sub('[^\w]', '', unicode_string)
        unicode_string = unicode_string.lower()
        string = unicode_string.encode('utf-8')
        return string

    def _transform_umlauts_to_ascii(self, s):
        return unidecode(s)

    def _extractLyricsFromPage(self, lyricsPage):
        lyrics = self._getPartOfStringBetweenTwoSubstrings(
            string = lyricsPage,
            beginSubstring = '<!-- start of lyrics -->',
            endSubstring= '<!-- end of lyrics -->'
        )
        return self._removeHtmlTags(lyrics)


class SongMeaningsLyricsGainer(BaseSiteLyricsGainer):
    base_url = 'http://www.songmeanings.net'

    @inlineCallbacks
    def get(self):
        artist_page = yield self.getArtistPage()
        song_url = self.getSongUrlByArtistPage(artist_page)
        song_page = yield getPage(song_url)
        lyrics = self.getLyricsByLyricsPage(song_page)
        self.validate_lyrics_not_empty(lyrics)
        returnValue(lyrics)

    @inlineCallbacks
    def getArtistPage(self):
        artist_search_result_page = yield getPage(self.getArtistSearchUrl())
        if not self.isArtistSearchPage(artist_search_result_page):
            returnValue(artist_search_result_page)
        artist_url = self.getArtistSearchUrlByArtistsPage(self.artist, artist_search_result_page)
        artist_page = yield getPage(artist_url)
        returnValue(artist_page)

    def getArtistSearchUrl(self):
        qs = urlencode({'query': self.artist, 'type': 'artists'})
        return urljoin(self.base_url, '/query/?%s' % qs)

    @classmethod
    def getArtistSearchUrlByArtistsPage(self, artist, artist_search_result_page):
        table = self._getSoup(artist_search_result_page, 'table', {'summary': 'table'})
        # It might be so that artist search renders actually search results.
        # To find the right artist we just select one with maximum lyrics submitted.
        # We can do that since we're not actually searching: artist is known exactly
        # so there must be just some mistake
        trs = table.findAll('tr', {'class': 'item'})
        artists = []
        for tr in trs:
            link = tr.find('a', text=lambda s: s.lower() == artist.lower())
            if not link:
                continue
            url = link.parent['href']
            count = int(tr.findAll('td')[1].text)
            artists.append((count, url))
        if not artists:
            raise LyricsNotFound
        top_count, top_url = sorted(artists, reverse=True)[0]
        return self.getAbsoluteUrl(top_url)

    def getSongUrlByArtistPage(self, artist_page):
        table = self._getSoup(artist_page, 'tbody', {'id': 'songslist'})
        link = table.find('a', text=lambda text: text.lower() == self.track.lower())
        url = link.parent['href']
        return self.getAbsoluteUrl(url)

    @classmethod
    def getAbsoluteUrl(self, url):
        return urljoin(self.base_url, str(url))

    def getLyricsByLyricsPage(self, song_page):
        soup = self._getSoup(song_page, 'div', {'id': 'lyricsblock2'})
        return self._removeHtmlTags(str(soup))

    def isArtistSearchPage(self, page):
        title = self._getSoup(page, 'title', {}).contents[0]
        return title.startswith('Search')

    def validate_lyrics_not_empty(self, lyrics):
        if lyrics.strip().startswith('We currently do not have these lyrics'):
            raise LyricsNotFound

