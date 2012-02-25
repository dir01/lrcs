if (typeof lrcs === 'undefined') lrcs = {};


(function(){

    lrcs.App = Backbone.View.extend({
        render: function(){
           this.searchFormView.render();
           this.lastFmView.render();
           this.sidebarView.render();
           this.lyricsView.render();
        },

        onTrackSearched: function(track){
            console.log('track searched')
            this.currentTrack.replaceWith(track);
        },

        onTrackClicked: function(track){
            console.log('track clicked')
            this.currentTrack.replaceWith(track);
        },

        onTrackChanged: function(poller){
            var track = poller.get('track');
            this.currentTrack.replaceWith(track);
        }

    });

    lrcs.buildApp = function(){
        var app = new lrcs.App;
        app.currentTrack = new lrcs.models.Track;
        app.currentAlbum = new lrcs.models.Album({track: app.currentTrack});
        app.currentLyrics = new lrcs.models.Lyrics({track: app.currentTrack});
        app.lastFmConnector = new lrcs.models.LastFmConnector;

        app.searchFormView = new lrcs.views.SearchFormView({
            el: $('#search-box'),
            model: app.currentTrack
        });

        app.sidebarView = new lrcs.views.SidebarView({
            el: $('#sidebar'),
            template: $('#sidebar_template'),
            model: app.currentAlbum
        });

        app.lyricsView = new lrcs.views.LyricsView({
            el: $('#lyrics-box'),
            model: app.currentLyrics,
            album: app.currentAlbum
        });

        app.lastFmView = new lrcs.views.LastFmView({
            el: $('#lastfm-control-box'),
            model: app.lastFmConnector,
            watchingTemplate: $('#lastfm-watching-template'),
            idleTemplate: $('#lastfm-idle-template'),
            disconnectedTemplate: $('#lastfm-disconnected-template')
        });

        app.searchFormView.bind('track_searched', app.onTrackSearched, app);
        app.sidebarView.bind('track_clicked', app.onTrackClicked, app);
        app.lastFmConnector.bind('change:track', app.onTrackChanged, app);
        return app;
    };

    lrcs.lastFM = new LastFmAPIAdapter({
        apiKey: $('meta[name=last-fm-api-key]').attr('content')
    });

})();


$(function(){
    lrcs.app = lrcs.buildApp();
    lrcs.app.render();
});
