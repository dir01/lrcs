
var lrcs = lrcs || {};

(function() {

    lrcs.App = Backbone.View.extend({

        render: function() {
            this.searchFormView.render();
            this.lastFmView.render();
            this.lyricsView.render();
            this.sidebarView.render();
        },

        whenLastFmUsernameChanged: function(connector, username) {
            $.cookie('username', username, {
                expires: 500 // days
            });
        },

        whenSearchedForTrack: function(track) {
            this.lastFmConnector.stopWatching();
            this.setTrack(track);
        },

        whenClickedOnTrack: function(track) {
            this.lastFmConnector.stopWatching();
            this.setTrack(track);
        },

        whenNowPlayingTrackChanged: function(connector) {
            var track = connector.get('track');
            this.setTrack(track);
        },

        setTrack: function(track) {
            var oldTrack = this.track;
            this.track = track;
            this.searchFormView.setTrack(track).render();
            this.sidebarView.setTrack(track).render();
            this.lyrics.setTrack(track).fetch();
            if (track.hasDifferentAlbumFrom(oldTrack))
                this.album.setTrack(track).fetch();
        },

        whenLyricsLoaded: function(lyrics) {
            this.lyricsView.setLyrics(lyrics).render();
        },

        whenAlbumLoaded: function(album) {
            this.lyricsView.setAlbum(album).renderImage();
            this.sidebarView.setAlbum(album).render();
        }

    });

    lrcs.buildApp = function() {
        var app = new lrcs.App;

        app.track = new lrcs.models.Track();
        app.lyrics = new lrcs.models.Lyrics();
        app.album = new lrcs.models.Album();
        app.lastFmConnector = new lrcs.models.LastFmConnector({
            username: $.cookie('username')
        });

        app.searchFormView = new lrcs.views.SearchFormView({
            el: $('#search-box')
        });

        app.lyricsView = new lrcs.views.LyricsView({
            el: $('#lyrics-box')
        });

        app.sidebarView = new lrcs.views.SidebarView({
            el: $('#sidebar'),
            template: $('#sidebar_template')
        });

        app.lastFmView = new lrcs.views.LastFmView({
            el: $('#lastfm-control-box'),
            model: app.lastFmConnector,
            watchingTemplate: $('#lastfm-watching-template').html(),
            idleTemplate: $('#lastfm-idle-template').html(),
            disconnectedTemplate: $('#lastfm-disconnected-template').html()
        });

        app.lyrics.bind('change', app.whenLyricsLoaded, app);
        app.album.bind('change', app.whenAlbumLoaded, app);

        app.searchFormView.bind('track-searched', app.whenSearchedForTrack, app);
        app.sidebarView.bind('track-clicked', app.whenClickedOnTrack, app);
        app.lastFmConnector.bind('change:track', app.whenNowPlayingTrackChanged, app);
        app.lastFmConnector.bind('change:username', app.whenLastFmUsernameChanged, app);
        return app;
    };

    lrcs.lastFM = new lrcs.LastFmAPIAdapter({
        apiKey: $('meta[name=last-fm-api-key]').attr('content')
    });

})(lrcs);


$(function() {
    lrcs.app = lrcs.buildApp();
    lrcs.app.render();
});
