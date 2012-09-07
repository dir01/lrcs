from twisted.internet import protocol, reactor
from twisted.internet.defer import inlineCallbacks, returnValue
from txredis.protocol import Redis


class LyricsCache(object):
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
