import re

from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage
from unidecode import unidecode

from lyrics.grabbers.base import BaseSiteLyricsGainer


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
