from urllib import urlencode

from BeautifulSoup import BeautifulSoup, Comment
from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage

from lyrics.errors import LyricsNotFound
from lyrics.grabbers.base import BaseSiteLyricsGainer


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
