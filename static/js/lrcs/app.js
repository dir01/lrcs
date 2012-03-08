
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
            if (track.equals(oldTrack))
                return;

            this.track = track;

            this.searchFormView.setTrack(track);
            this.sidebarView.setTrack(track);

            this.loadNewLyrics();

            if (track.hasDifferentAlbumFrom(oldTrack))
                this.loadNewAlbum();
        },

        loadNewLyrics: function() {
            this.lyricsView.displayLoadingIndicator();
            this.lyrics.setTrack(this.track).fetch({
                success: this.setLyrics.bind(this),
                error: this.whenLyricsHaventLoaded.bind(this)
            });
        },

        loadNewAlbum: function() {
            this.sidebarView.displayLoadingIndicator();
            this.lyricsView.hideImage();
            lrcs.music.getAlbum(
                this.track.get('artist'),
                this.track.get('album'),
                this.setAlbum.bind(this)
            );
        },

        whenLyricsHaventLoaded: function(lyrics, response) {
            this.lyricsView.hideLoadingIndicator();
            if (response.status === 404) {
                lyrics.set('lyrics', '');
                this.setLyrics(lyrics);
            }
        },

        setLyrics: function(lyrics) {
            this.lyricsView.setLyrics(lyrics);
        },

        setAlbum: function(album) {
            this.lyricsView.setAlbum(album);
            this.sidebarView.setAlbum(album);
        }

    });

    lrcs.buildApp = function() {
        var app = new lrcs.App;

        app.track = new lrcs.models.Track();
        app.lyrics = new lrcs.models.Lyrics();
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
            el: $('#sidebar-box'),
            template: lrcs.tools.template('sidebar-template')
        });

        app.lastFmView = new lrcs.views.LastFmView({
            el: $('#lastfm-control-box'),
            model: app.lastFmConnector,
            watchingTemplate: lrcs.tools.template('lastfm-watching-template'),
            idleTemplate: lrcs.tools.template('lastfm-idle-template'),
            disconnectedTemplate: lrcs.tools.template('lastfm-disconnected-template'),
        });

        app.searchFormView.bind('track-searched', app.whenSearchedForTrack, app);
        app.sidebarView.bind('track-clicked', app.whenClickedOnTrack, app);
        app.lastFmConnector.bind('change:track', app.whenNowPlayingTrackChanged, app);
        app.lastFmConnector.bind('change:username', app.whenLastFmUsernameChanged, app);
        return app;
    };

    lrcs.lastFm = new lrcs.LastFmAPIAdapter({
        apiKey: $('meta[name=last-fm-api-key]').attr('content')
    });

    lrcs.music = new lrcs.Music(lrcs.lastFm);

})(lrcs);


$(function() {
    lrcs.app = lrcs.buildApp();
    lrcs.app.render();
});
