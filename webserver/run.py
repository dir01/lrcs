from twisted.internet import reactor
from settings import settings
from webserver.site import site


def main():
    print 'Start listening on http://localhost:8080/'
    reactor.listenTCP(8080, site)
    reactor.run()


if __name__ == '__main__':
    from utils import autoreload
    autoreload.main(main, root=settings.PROJECT_ROOT, extensions=['.py', '.jinja2'])
