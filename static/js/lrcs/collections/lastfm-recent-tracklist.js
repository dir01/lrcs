var lrcs = lrcs || {};
lrcs.collections = lrcs.collections || {};

(function(lrcs) {

    lrcs.collections.LastFmRecentTracklist = Backbone.Collection.extend({

        model: lrcs.models.Track,

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
                    success(response, status);
                collection.trigger('sync', collection, response, options);
            };

            var error = options.error;
            options.error = function(response) {
                if (error)
                    error(collection, response, options);
                collection.trigger('error', collection, response, options);
            };

            return lrcs.lastfm.getRecentTracksInfo(this.username, this.number)
                .then(options.success, options.error);
        }

    });

})(lrcs);