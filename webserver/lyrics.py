import re
from urllib import urlencode
from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage
from BeautifulSoup import BeautifulSoup, SoupStrainer, Comment


class LyricsNotFound(Exception):
    pass


class LyricsGainer(object):
    def __init__(self, artist, track):
        self.artist = artist
        self.track = track
        self.nextSourceIndex = 0

    @inlineCallbacks
    def get(self):
        while True:
            try:
                lyrics = yield self.getLyricsFromNextSourceOrFail()
                returnValue(lyrics)
            except IndexError:
                raise LyricsNotFound('All sources gave no lyrics')
            except Exception:
                pass

    def getLyricsFromNextSourceOrFail(self):
        SOURCES = [
            LyricsWikiaComLyricsGainer,
            AZLyricsLyricsGainer,
        ]
        source = SOURCES[self.nextSourceIndex]
        self.nextSourceIndex += 1
        return source(self.artist, self.track).get()


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
        self._excludeFromSoup(soup,
            {'name':'p'},
            {'name':'div', 'attrs': {'class':'rtMatcher'}},
            {'text':lambda text:isinstance(text, Comment)}
        )
        lyrics = ''.join(map(lambda s: s if isinstance(s, unicode) else '\n', soup))
        return lyrics


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
