define([
    'lib/jquery',
    'lib/underscore',
    'lib/backbone',
    'core/tools',
    'views/lastfm-recent-track'
], function($, _, Backbone, Tools, LastFmRecentTrackView) {

'use strict';


var LastFmRecentTracklistView = Backbone.View.extend({

    tagName: 'div',
    id: 'last-fm-tracks-container',

    initialize: function(options) {
        this.trackViews = [];

        this.$waiter = this.createWaiter().appendTo(this.el);
        this.$list = this.createList().appendTo(this.el);

        this.listenTo(this.collection, 'reset', this.render);

        this.renderWaiting();
    },

    createWaiter: function() {
        return Tools.createWaiter('tiny');
    },

    createList: function() {
        return $('<ol id="last-fm-tracks">');
    },

    renderWaiting: function() {
        this.$el.addClass('waiting');
    },

    render: function() {
        this.$el.removeClass('waiting');
        this.clear();
        this.addTracks(this.collection);
    },

    clear: function() {
        _.invoke(this.trackViews, 'remove');
        this.trackViews = [];
    },

    addTracks: function(tracks) {
        tracks.each(this.addTrack.bind(this));
    },

    addTrack: function(track) {
        var view = this.createTrackView(track);
        view.render();
        this.$list.append(view.el);
        this.trackViews.push(view);
    },

    createTrackView: function(track) {
        return new LastFmRecentTrackView({ track: track });
    }

});

return LastFmRecentTracklistView;


});
