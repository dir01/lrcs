import re

from BeautifulSoup import BeautifulSoup, SoupStrainer


class BaseSiteLyricsGainer(object):
    RE_HTML_TAG = re.compile(r'<.*?>')

    def __init__(self, artist, track):
        self.artist = artist
        self.track = track

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
