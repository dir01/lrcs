
var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Track = Backbone.Model.extend({

        defaults: {
            artist: '',
            title: '',
            album: ''
        },

        toString: function() {
            return this.get('artist') + ' - ' + this.get('title');
        },

        equals: function(track) {
            var importantFields = ['artist', 'album', 'title'],
                us = this,
                ourImportantData = {},
                theirImportantData = {};

            _.each(importantFields, function(field) {
                ourImportantData[field] = us.get(field);
                theirImportantData[field] = track.get(field);
            });

            return _.isEqual(ourImportantData, theirImportantData);
        },

        hasDifferentAlbumFrom: function(track) {
            return this.get('album') !== track.get('album') ||
                this.get('artist') !== track.get('artist');
        },

        isEmpty: function() {
            return !(
                this.get('artist') &&
                    this.get('title')
                );
        },

    });


    lrcs.models.Album = Backbone.Model.extend({

        defaults: {
            artist: '',
            title: '',
            image: '',
            tracks: []
        },

        isEmpty: function() {
            return this.get('tracks').length === 0;
        }

    });


    lrcs.models.Lyrics = Backbone.Model.extend({

        track: null,

        defaults: {
            lyrics: ''
        },

        setTrack: function(track) {
            this.track = track;
            return this;
        },

        url: function() {
            return [
                '/lyrics',
                this.getQueryString()
            ].join('?');
        },

        getQueryString: function() {
            return $.param({
                artist: this.track.get('artist'),
                track: this.track.get('title')
            });
        },

        getText: function() {
            return this.get('lyrics');
        },

        getPrettyText: function() {
            var uglyText = this.getText(),
                paragraphedText = uglyText.replace(/\n\n/g, '</p><p>'),
                newLinedText = paragraphedText.replace(/\n/g, '<br/>'),
                wrappedText = '<p>' + newLinedText + '</p>';
            return wrappedText;
        },

        isEmpty: function() {
            return !this.getText();
        }

    });


    lrcs.models.LastFmConnector = Backbone.Model.extend({
        delay: 10 * 1000, //10s

        defaults: {
            track: null,
            username: '',
            isWatching: false
        },

        initialize: function() {
            var username = this.get('username');
            if (username != null)
                this.startWatching();
        },

        connectTo: function(username) {
            this.set({ username: username });
            this.startWatching();
        },

        disconnect: function() {
            this.set({ username: null });
            this.stopWatching();
        },

        isConnected: function() {
            return Boolean(this.get('username'));
        },

        startWatching: function() {
            if (this.isWatching())
                return;
            this.timer = window.setInterval(this.poll.bind(this), this.delay);
            this.poll(); // launch polling right away when starting
            this.set({ isWatching: true });
        },

        stopWatching: function() {
            if (!this.isWatching())
                return;
            window.clearInterval(this.timer);
            delete this.timer;
            this.set({ isWatching: false });
        },

        isWatching: function() {
            return Boolean(this.timer);
        },

        poll: function() {
            lrcs.lastFm.getLastPlayedTrackInfo(
                this.get('username'),
                this.setTrackIfTrackIsNowPlaying.bind(this)
            );
        },

        setTrackIfTrackIsNowPlaying: function(trackInfo) {
            if (trackInfo.isNowPlaying)
                lrcs.music.getTrack(
                    trackInfo.artist,
                    trackInfo.title,
                    this.setNowPlayingTrack.bind(this)
                );
        },

        setNowPlayingTrack: function(track) {
            this.set({ 'track': track });
        }

    });

})(lrcs);
