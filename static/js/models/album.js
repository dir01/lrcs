define([
    'lib/backbone',
    'core/lastfm',
    'collections/tracklist'
], function(Backbone, LastFm, Tracklist) {

'use strict';


var Album = Backbone.Model.extend({

    sync: function(method, model, options) {
        if (method !== 'read')
            throw new Error;

        var success = options.success;
        options.success = function(response) {
            if (success)
                success(model, response, options);
            model.trigger('sync', model, response, options);
        };

        var error = options.error;
        options.error = function(response) {
            if (error)
                error(model, response, options);
            model.trigger('error', model, response, options);
        };

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

    getImage: function() {
        return this.get('image');
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
