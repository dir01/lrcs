define([
    'lib/backbone',
    'core/lastfm',
    'models/scrobble'
], function(Backbone, LastFm, Scrobble) {

'use strict';


var LastFmScrobbleList = Backbone.Collection.extend({

    model: Scrobble,

    initialize: function(models, options) {
        this.username = options.username;
        this.number = options.number;
    },

    sync: function(method, model, options) {
        if (method !== 'read')
            throw new Error;

        // FIXME: For now, we always fully reset this collection,
        //        rather than letting Backbone fire individual "add"
        //        and "remove" events so that we can smartly update
        //        the view. Not sure if it's even worth doing "properly"
        //        but I guess one day.
        options.reset = true;

        var promise = LastFm.getRecentTracksInfo(this.username, this.number);
        promise.done(options.success);
        promise.fail(options.error);
        return promise;
    }

});

return LastFmScrobbleList;


});
