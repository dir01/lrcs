import simplejson
from functools import partial

from jinja2_environment import jinja2_env

from twisted.internet import reactor
from twisted.web.server import Site, NOT_DONE_YET
from twisted.web.resource import Resource, NoResource

from lyrics import LyricsGainer


class Lyrics(Resource):
    def render_GET(self, request):
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


class IndexPage(Resource):
    TEMPLATE_NAME = 'index.jinja2'

    def render_GET(self, request):
        return self.get_rendered_template()

    def get_rendered_template(self):
        return self.get_template().render().encode('utf-8')

    def get_template(self):
        return jinja2_env.get_template(self.TEMPLATE_NAME)


root = Resource()
root.putChild('', IndexPage())
root.putChild('lyrics', Lyrics())

factory = Site(root)

reactor.listenTCP(8080, factory)
reactor.run()
