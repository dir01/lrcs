var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Track = Backbone.Model.extend({

        toString: function() {
            return this.artist() + ' - ' + this.title();
        },

        artist: function() {
            return this.get('artist');
        },

        title: function() {
            return this.get('title');
        }

    });

})(lrcs);