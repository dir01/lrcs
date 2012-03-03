if (typeof lrcs === 'undefined') lrcs = {};
if (typeof lrcs.models === 'undefined') lrcs.models = {};


(function() {

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

        isEmpty: function() {
            return !(
                this.get('artist') &&
                    this.get('title')
                );
        },

    });


    lrcs.models.Album = Backbone.Model.extend({

        track: null,

        defaults: {
            artist: '',
            title: '',
            image: '',
            trackList: []
        },

        setTrack: function(track) {
            this.track = track;
            return this;
        },

        fetch: function() {
            lrcs.lastFM.getAlbumInfo(
                this.track.get('artist'),
                this.track.get('title'),
                this.setInfo.bind(this)
            );
        },

        setInfo: function(album) {
            var data = album.toJSON();
            this.set({
                artist: data.artist,
                title: data.title,
                image: data.largestImage,
                trackList: _.map(data.tracks, this.createTrackFromData.bind(this))
            });
        },

        createTrackFromData: function(data) {
            return new lrcs.models.Track({
                artist: data.artist,
                album: data.album,
                title: data.title
            });
        },

        isEmpty: function() {
            return !(
                this.get('artist') &&
                    this.get('title') &&
                    this.get('trackList')
                );
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
            lrcs.lastFM.getLastPlayedTrack(
                this.get('username'),
                this.setTrackIfTrackIsNowPlaying.bind(this)
            );
        },

        setTrackIfTrackIsNowPlaying: function(lastFmTrack) {
            if (lastFmTrack.isNowPlaying())
                lrcs.lastFM.getTrackInfo(
                    lastFmTrack.getArtist(),
                    lastFmTrack.getTitle(),
                    this.setNowPlayingTrack.bind(this)
                );
        },

        setNowPlayingTrack: function(lastFmTrack) {
            this.set({'track': this.constructTrackByLastFmTrack(lastFmTrack)});
        },

        constructTrackByLastFmTrack: function(lastFmTrack) {
            return new lrcs.models.Track({
                artist: lastFmTrack.getArtist(),
                title: lastFmTrack.getTitle(),
                album: lastFmTrack.getAlbum()
            });
        }

    });

})();
