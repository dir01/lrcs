define([
    'lib/backbone',
    'lib/moment',
    'core/tools',
    'core/lastfm'
], function(Backbone, Moment, Tools, LastFm) {

'use strict';


var Track = Backbone.Model.extend({

    _hasBeenFetched: false,

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
        return this.getArtist() + ' - ' + this.getTitle();
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

    isNowPlaying: function() {
        return this.get('isNowPlaying');
    },

    hasSameAlbumAs: function(track) {
        return Boolean(track) &&
            this.getAlbumArtist() == track.getAlbumArtist() &&
            this.getAlbumTitle() == track.getAlbumTitle();
    },

    hasAlbum: function() {
        return Boolean(this.get('album'));
    },

    getTimePlayedString: function() {
        if (this.isNowPlaying())
            return "playing now";
        else {
            var timePlayed = this.get('timePlayed');
            if (timePlayed)
                return Moment.unix(timePlayed).fromNow();
        }
        return "never";
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
    },

    getTimePlayed: function() {
        return this.get('timePlayed');
    }

});

return Track;


});
