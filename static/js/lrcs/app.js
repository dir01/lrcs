if (typeof lrcs === 'undefined') lrcs = {};


(function(){

    lrcs.App = Backbone.View.extend({
        render: function(){
           this.searchFormView.render();
           this.sidebarView.render();
           this.lyricsView.render();
        },

        onTrackSearched: function(track){
            this.currentTrack.replaceWith(track);
        },

        onSidebarTrackClicked: function(track){
            this.currentTrack.replaceWith(track);
        },

        onLastFmNowPlayingTrackChanged: function(poller){
            var track = poller.get('track');
            this.currentTrack.replaceWith(track);
        }

    });

    lrcs.buildApp = function(){
        var app = new lrcs.App;
        app.currentTrack = new lrcs.models.Track;
        app.currentAlbum = new lrcs.models.Album({track: app.currentTrack});
        app.currentLyrics = new lrcs.models.Lyrics({track: app.currentTrack});
        app.lastFmPoller = new lrcs.models.LastFmPoller;

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

        app.searchFormView.bind('track_searched', app.onTrackSearched, app);
        app.sidebarView.bind('track_clicked', app.onSidebarTrackClicked, app);
        app.lastFmPoller.bind('change:track', app.onLastFmNowPlayingTrackChanged, app);
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
