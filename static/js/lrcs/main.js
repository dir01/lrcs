
$(function() {

    lrcs.lastFm = new lrcs.LastFmAPIAdapter({
        apiKey: $('meta[name=last-fm-api-key]').attr('content')
    });

    lrcs.music = new lrcs.Music(lrcs.lastFm);

    var app = new lrcs.models.App(),
        appView = new lrcs.views.App({ model: app });
    appView.render();

});

