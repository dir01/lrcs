from twisted.application import service, internet
from webserver.site import site

application = service.Application('lrcs')
server = internet.TCPServer(8081, site)
server.setServiceParent(application)
