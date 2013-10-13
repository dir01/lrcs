define([
    'core/cached-model',
    'core/tools',
    'core/lastfm'
], function(CachedModel, Tools, LastFm) {

'use strict';


var Track = CachedModel.extend({

    name: 'track',
    identifiers: ['artist', 'title'],

    _hasBeenFetched: false,

    sync: function(method, model, options) {
        if (method !== 'read')
            throw new Error;

        var promise = LastFm.getTrackInfo(this.getArtist(), this.getTitle());
        promise.always(this._fetchDone);
        promise.done(options.success);
        promise.fail(options.error);
        return promise;
    },

    _fetchDone: function() {
        this._hasBeenFetched = true;
    },

    toString: function() {
        return this.getArtist() + ' – ' + this.getTitle();
    },

    getPath: function() {
        return '/' + Tools.encodeURIPart(this.getArtist()) +
            '/' + Tools.encodeURIPart(this.getTitle());
    },

    isStub: function() {
        // we use .has here because the field can be empty for non-stub tracks
        return !this.has('album') && !this._hasBeenFetched;
    },

    isEqualTo: function(track) {
        return Boolean(track) && 
            this.getArtist() == track.getArtist() && 
            this.getTitle() == track.getTitle();
    },

    hasSameAlbumAs: function(track) {
        return Boolean(track) &&
            this.getAlbumArtist() == track.getAlbumArtist() &&
            this.getAlbumTitle() == track.getAlbumTitle();
    },

    hasAlbum: function() {
        return Boolean(this.get('album'));
    },

    getImage: function() {
        return this.get('image');
    },

    getArtist: function() {
        return this.get('artist');
    },

    getTitle: function() {
        return this.get('title');
    },

    getAlbumArtist: function() {
        return this.get('albumArtist');
    },

    getAlbumTitle: function() {
        return this.get('album');
    }

});

return Track;


});
