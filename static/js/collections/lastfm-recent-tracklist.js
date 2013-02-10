define([
    'core/lastfm',
    'collections/tracklist'
], function(LastFm, Tracklist) {

'use strict';


var LastFmRecentTracklist = Tracklist.extend({

    initialize: function(models, options) {
        this.username = options.username;
        this.number = options.number;
    },

    sync: function(method, collection, options) {
        if (method !== 'read')
            throw new Error;

        var success = options.success;
        options.success = function(response) {
            if (success)
                success(collection, response, options);
            collection.trigger('sync', collection, response, options);
        };

        var error = options.error;
        options.error = function(response) {
            if (error)
                error(collection, response, options);
            collection.trigger('error', collection, response, options);
        };

        var promise = LastFm.getRecentTracksInfo(this.username, this.number);
        promise.done(options.success);
        promise.fail(options.error);
        return promise.promise();
    }

});

return LastFmRecentTracklist;


});
