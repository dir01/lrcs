# -*- coding: utf8 -*-
import re
from urllib import urlencode

from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage
from lyrics.errors import LyricsNotFound

from lyrics.grabbers.base import BaseSiteLyricsGainer

lyrics_link_onclick_re = re.compile(
    "Audio.showLyrics\('(-?\d+_\d+)',(\d+),(\d+)\); return cancelEvent\(event\);"
)


class VkontakteLyricsGainer(BaseSiteLyricsGainer):
    base_url = 'http://vk.com/audio'

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
    }

    cookies = {
        'remixsid': 'c076f2b62335aff1fe67eaba9ea095dc2722ae9a1af7a201ddec68845653855119b4'
    }

    @inlineCallbacks
    def get(self):
        audio_search_page = yield self.postPage(self.getPostData())
        lyrics_link = self._getSoup(audio_search_page, 'span', {'class': 'title'}).a
        onclick_re_match = lyrics_link_onclick_re.match(lyrics_link['onclick'])
        aid, lid, top = onclick_re_match.groups()
        data = {'act': 'get_lyrics','al': 1,'aid': aid,'lid': lid,'top': top}
        lyrics_page = yield self.postPage(data)
        lyrics = re.search(r'<!>.*<!>(.*)$', lyrics_page).groups()[0]
        lyrics = lyrics.decode('cp1251')
        lyrics = lyrics.replace('<br>', '\n')
        lyrics = self._removeHtmlTags(lyrics)
        self.validateLyrics(lyrics)
        returnValue(lyrics)

    @inlineCallbacks
    def postPage(self, data):
        page = yield getPage(
            self.base_url,
            method='POST',
            postdata=urlencode(data),
            headers=self.headers,
            cookies=self.cookies
        )
        returnValue(page)

    def getPostData(self):
        return {
            'act': 'search',
            'al': 1,
            'gid':0,
            'id': 53588545,
            'offset': 0,
            'lyrics': 1,
            'performer': 0,
            'q': '%s %s' % (self.artist, self.track),
            'sort': 0,
        }

    def validateLyrics(self, lyrics):
        if len(lyrics) < 200:
            raise LyricsNotFound
