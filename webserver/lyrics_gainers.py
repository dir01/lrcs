import re
from urllib import urlencode
from twisted.internet import reactor, protocol
from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage
from BeautifulSoup import BeautifulSoup, SoupStrainer, Comment
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


class LyricsWikiaComLyricsGainer(BaseSiteLyricsGainer):
    base_url = 'http://lyrics.wikia.com'

    @inlineCallbacks
    def get(self):
        apiResponse = yield getPage(self._getApiResponseUrl())
        lyricsPageUrl = self._parseApiResponse(apiResponse)
        lyricsPage = yield getPage(lyricsPageUrl)
        lyrics = self._parseLyricsPage(lyricsPage)
        returnValue(lyrics)

    def _getApiResponseUrl(self):
        query = urlencode(dict(
            func = 'getSong',
            fmt = 'xml',
            artist = self.artist.encode('utf-8'),
            song = self.track.encode('utf-8')
        ))
        return '%s/api.php?%s' % (self.base_url, query)

    def _parseApiResponse(self, response):
        xml = BeautifulSoup(response)
        if xml.find('lyrics').text == 'Not found':
            raise LyricsNotFound()
        result = xml.find('url').text
        return str(result)

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
        return re.sub('[^\w]', '', string.replace('&', 'and')).lower()

    def _extractLyricsFromPage(self, lyricsPage):
        lyrics = self._getPartOfStringBetweenTwoSubstrings(
            string = lyricsPage,
            beginSubstring = '<!-- start of lyrics -->',
            endSubstring= '<!-- end of lyrics -->'
        )
        return self._removeHtmlTags(lyrics)
