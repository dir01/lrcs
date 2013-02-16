define([
    'lib/underscore',
    'lib/backbone',
    'views/album-track'
], function(_, Backbone, AlbumTrackView) {

'use strict';


var AlbumTracklistView = Backbone.View.extend({

    tagName: 'ol',
    id: 'tracklist',

    initialize: function(options) {
        this.trackViews = [];

        if (options && options.tracklist)
            this.setTracklist(tracklist);
    },

    setTracklist: function(tracklist) {
        this.clear();
        tracklist.each(this.addTrack.bind(this));
    },

    clear: function() {
        _.invoke(this.trackViews, 'remove');
        this.trackViews = [];
    },

    addTrack: function(track) {
        var view = new AlbumTrackView({ track: track });
        view.render();

        this.$el.append(view.el);
        this.trackViews.push(view);
    }

});

return AlbumTracklistView;


});
