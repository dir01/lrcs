define([
    'core/cached-model',
    'core/lastfm',
    'collections/tracklist'
], function(CachedModel, LastFm, Tracklist) {

'use strict';


var Album = CachedModel.extend({

    name: 'album',
    identifiers: ['artist', 'title'],

    sync: function(method, model, options) {
        if (method !== 'read')
            throw new Error;

        var promise = LastFm.getAlbumInfo(this.getArtist(), this.getTitle());
        promise.done(options.success);
        promise.fail(options.error);
        return promise;
    },

    isStub: function() {
        return !this.has('tracks') && !this.has('image');
    },

    isEmpty: function() {
        return !this.has('tracks') || this.get('tracks').length == 0
    },

    getArtist: function() {
        return this.get('artist');
    },

    getTitle: function() {
        return this.get('title');
    },

    getExtraLargeImage: function() {
        return this.getImageBySize('extralarge');
    },

    getImageBySize: function(size) {
        var allImages = this.getAllImages();
        return allImages[size];
    },

    getAllImages: function() {
        return this.get('images');
    },

    getTracklist: function() {
        return this._tracklist = this._tracklist || this.createTracklist();
    },

    createTracklist: function() {
        return new Tracklist(this.get('tracks'));
    }

}, {

    getForTrack: function(track) {
        return Album.createFromTrack(track);
    },

    createFromTrack: function(track) {
        return new Album({
            artist: track.getAlbumArtist(),
            title: track.getAlbumTitle()
        });
    }

});

return Album;


});
