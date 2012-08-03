var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Track = Backbone.Model.extend({

        _isComplete: false,

        fetch: function() {
            return lrcs.lastfm.getTrackInfo(
                this.artist(), this.title()
            ).then(
                this._doneFetch.bind(this),
                this._failedFetch.bind(this, 'error')
            );
        },

        _doneFetch: function(data) {
            this.set(data);
            this._isComplete = true;
        },

        _failedFetch: function(error) {
            this.trigger('error', error);
            this._isComplete = true;
        },

        path: function() {
            return this.artist() + '/' + this.title();
        },

        toString: function() {
            return this.artist() + ' - ' + this.title();
        },

        isStub: function() {
            return !this.has('album') && !this._isComplete;
        },

        isEqualTo: function(track) {
            return Boolean(track) && 
                this.artist() == track.artist() && 
                this.title() == track.title();
        },

        hasSameAlbumAs: function(track) {
            return Boolean(track) &&
                this.albumArtist() == track.albumArtist() &&
                this.albumName() == track.albumName();
        },

        lyrics: function() {
            return this._lyrics = this._lyrics || this._createLyrics();
        },

        album: function() {
            return this._album = this._album || this._createAlbum();
        },

        hasAlbum: function() {
            return Boolean(this.get('album'));
        },

        artist: function() {
            return this.get('artist');
        },

        title: function() {
            return this.get('title');
        },

        albumArtist: function() {
            return this.get('albumArtist');
        },

        albumName: function() {
            return this.get('album');
        },

        _createLyrics: function() {
            return new lrcs.models.Lyrics({
                artist: this.artist(),
                track: this.title()
            });
        },

        _createAlbum: function() {
            return new lrcs.models.Album({
                artist: this.albumArtist(),
                title: this.albumName()
            });
        }

    });

})(lrcs);