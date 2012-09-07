from twisted.internet.defer import inlineCallbacks, returnValue

from lyrics.cache import LyricsCache
from lyrics.errors import LyricsNotFound
from lyrics.grabbers import PRIORITIZED_LYRICS_GAINERS_LIST


class LyricsManager(object):
    def __init__(self, artist, track):
        self.artist = artist
        self.track = track

    @inlineCallbacks
    def get(self):
        lyrics = yield self.getLyricsFromCache()
        if lyrics:
            returnValue(lyrics)
        for source in PRIORITIZED_LYRICS_GAINERS_LIST:
            try:
                lyrics = yield self.getLyricsFromSource(source)
                yield self.saveLyricsToCache(lyrics)
                returnValue(lyrics)
            except Exception:
                pass
        raise LyricsNotFound('All sources gave no lyrics')

    @inlineCallbacks
    def getLyricsFromSource(self, source):
        lyrics = yield source(self.artist, self.track).get()
        returnValue(lyrics)

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
        return LyricsCache(self.artist, self.track)
