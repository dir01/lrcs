var lrcs = lrcs || {};
lrcs.collections = lrcs.collections || {};

(function(lrcs) {

    lrcs.collections.Tracklist = Backbone.Collection.extend({

        model: lrcs.models.Track

    });

})(lrcs);