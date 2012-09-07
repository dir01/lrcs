from urllib import urlencode
from urlparse import urljoin

from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.web.client import getPage

from lyrics.errors import LyricsNotFound
from lyrics.grabbers.base import BaseSiteLyricsGainer


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
