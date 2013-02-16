define([
    'lib/backbone',
    'core/dispatch',
    'core/tools',
    'models/track'
], function(Backbone, Dispatch, Tools, Track) {

'use strict';


var Router = Backbone.Router.extend({

    routes: {
        '': 'index',
        ':artist/:title': 'trackPage',
    },

    initialize: function() {
        Dispatch.on(Dispatch.NAVIGATE.INDEX, this.navigateToIndex, this);
        Dispatch.on(Dispatch.NAVIGATE.TRACK_PAGE, this.navigateToTrack, this);
    },

    index: function() {
        Dispatch.visitIndex();
    },

    trackPage: function(artist, title) {
        var track = new Track({
            artist: Tools.decodeURIPart(artist),
            title: Tools.decodeURIPart(title)
        });
        Dispatch.visitTrack(track);
    },

    navigateToIndex: function() {
        this.navigate('/');
    },

    navigateToTrack: function(track) {
        this.navigate(track.getPath());
    }

});

return Router;


});
