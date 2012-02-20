import simplejson
from functools import partial
from twisted.internet import reactor
from twisted.web.server import Site, NOT_DONE_YET
from twisted.web.resource import Resource, NoResource

from lyrics import LyricsGainer


class Lyrics(Resource):
    def render(self, request):
        artist = request.args.get('artist')[0]
        track = request.args.get('track')[0]
        d = LyricsGainer(artist, track).get()
        d.addCallback(partial(self.renderWhenLyricsReady, request))
        d.addErrback(partial(self.responseNotFound, request))
        return NOT_DONE_YET

    def renderWhenLyricsReady(self, request, lyrics):
        request.write(simplejson.dumps({'lyrics': lyrics}))
        request.finish()

    def responseNotFound(self, request, failure):
        errorPage = NoResource(message=failure.getErrorMessage())
        request.write(errorPage.render(request))
        request.finish()

root = Resource()
root.putChild('lyrics', Lyrics())

factory = Site(root)
reactor.listenTCP(8080, factory)
reactor.run()