
var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.models.App = Backbone.Model.extend({

        defaults: {
            track: null,
            album: null,
            lyrics: null
        },

        initialize: function() {
            this.on('change:track', this.onTrackChanged, this);
        },

        onTrackChanged: function(app, track) {
            var previousTrack = this.previous('track');
            if (track.equals(previousTrack))
                return;

            this.loadLyricsForTrack(track);
            if (track.hasDifferentAlbumFrom(previousTrack))
                this.loadAlbumForTrack(track);
        },

        loadLyricsForTrack: function(track) {
            this.trigger('loading:lyrics');
            var lyrics = new lrcs.models.Lyrics();
            lyrics.setTrack(track).fetch({
                success: this.setLyricsIfAppropriate.bind(this),
                error: this.handleLyricsError.bind(this)
            });
        },

        loadAlbumForTrack: function(track) {
            this.trigger('loading:album');
            lrcs.music.getAlbum(
                track.get('artist'),
                track.get('album'),
                this.setAlbum.bind(this)
            );
        },

        handleLyricsError: function(lyrics, response) {
            if (response.status === 404)
                this.setLyricsIfAppropriate(lyrics);
            else
                this.trigger('error');
        },

        setLyricsIfAppropriate: function(lyrics) {
        	var lyricsTrack = lyrics.getTrack(),
        		currentTrack = this.get('track');
        	if (lyricsTrack.equals(currentTrack))
        		this.setLyrics(lyrics);
        },

        setTrack: function(track) {
            this.set({ track: track });
        },

        setAlbum: function(album) {
            this.set({ album: album });
        },

        setLyrics: function(lyrics) {
            this.set({ lyrics: lyrics });
        }

    });


    lrcs.views.AppView = Backbone.View.extend({

        initialize: function() {
            this.searchFormView = this.createSearchFormView();
            this.lyricsView = this.createLyricsView();
            this.albumArtView = this.createAlbumArtView();
            this.sidebarView = this.createSidebarView();

            this.createLastFmConnector();
            this.bindModelEvents();
        },

        createLastFmConnector: function() {
            this.lastFmConnector = new lrcs.models.LastFmConnector({
                username: $.cookie('username')
            });

            this.lastFmConnector.on('change:track', this.whenNowPlayingTrackChanged, this);
            this.lastFmConnector.on('change:username', this.whenLastFmUsernameChanged, this);

            this.lastFmView = new lrcs.views.LastFmView({
                el: $('#lastfm-control-box'),
                model: this.lastFmConnector,
                watchingTemplate: lrcs.tools.template('lastfm-watching-template'),
                idleTemplate: lrcs.tools.template('lastfm-idle-template'),
                disconnectedTemplate: lrcs.tools.template('lastfm-disconnected-template'),
            });
        },

        createSearchFormView: function() {
            var view = new lrcs.views.SearchFormView({ el: $('#search-box') });
            view.on('track-searched', this.whenSearchedForTrack, this);
            return view;
        },

        createLyricsView: function() {
            var view = new lrcs.views.LyricsView({ el: $('#lyrics-box') });
            return view;
        },

        createAlbumArtView: function() {
            var view = new lrcs.views.AlbumArtView({ el: $('#lyrics-background') });
            return view;
        },

        createSidebarView: function() {
            var view = new lrcs.views.SidebarView({
                el: $('#sidebar-box'),
                template: lrcs.tools.template('sidebar-template')
            });
            view.on('track-clicked', this.whenClickedOnTrack, this);
            return view;
        },

        bindModelEvents: function() {
            this.model.on('loading:album', this.albumLoading, this);
            this.model.on('loading:lyrics', this.lyricsLoading, this);
            this.model.on('change:track', this.trackChange, this);
            this.model.on('change:album', this.albumChange, this);
            this.model.on('change:lyrics', this.lyricsChange, this);
        },

        render: function() {
            this.searchFormView.render();
            this.lastFmView.render();
            this.lyricsView.render();
            this.albumArtView.render();
            this.sidebarView.render();
        },

        trackChange: function(app, track) {
            this.searchFormView.setTrack(track);
            this.sidebarView.setTrack(track);
        },

        albumLoading: function() {
            this.sidebarView.invalidate();
            this.albumArtView.invalidate();
        },

        albumChange: function(app, album) {
            this.sidebarView.setAlbum(album);
            this.albumArtView.setAlbum(album);
        },

        lyricsLoading: function() {
            this.lyricsView.invalidate();
        },

        lyricsChange: function(app, lyrics) {
            this.lyricsView.setLyrics(lyrics);
        },

        whenSearchedForTrack: function(track) {
            this.lastFmConnector.stopWatching();
            this.model.setTrack(track);
        },

        whenClickedOnTrack: function(track) {
            this.lastFmConnector.stopWatching();
            this.model.setTrack(track);
        },

        whenNowPlayingTrackChanged: function(connector) {
            var track = connector.get('track');
            this.model.setTrack(track);
        },

        whenLastFmUsernameChanged: function(connector, username) {
            $.cookie('username', username, {
                expires: 500 // days
            });
        }

    });

})(lrcs);


