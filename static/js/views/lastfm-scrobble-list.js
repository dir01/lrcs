define([
    'lib/jquery',
    'lib/underscore',
    'lib/backbone',
    'core/tools',
    'views/lastfm-scrobble'
], function($, _, Backbone, Tools, LastFmScrobbleView) {

'use strict';


var LastFmScrobbleListView = Backbone.View.extend({

    tagName: 'div',
    id: 'last-fm-tracks-container',

    initialize: function(options) {
        this.scrobbleViews = [];

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
        this.addScrobbles(this.collection);
    },

    clear: function() {
        _.invoke(this.scrobbleViews, 'remove');
        this.scrobbleViews = [];
    },

    addScrobbles: function(scrobbles) {
        scrobbles.each(this.addScrobble.bind(this));
    },

    addScrobble: function(scrobble) {
        var view = this.createScrobbleView(scrobble);
        view.render();
        this.$list.append(view.el);
        this.scrobbleViews.push(view);
    },

    createScrobbleView: function(scrobble) {
        return new LastFmScrobbleView({ scrobble: scrobble });
    }

});

return LastFmScrobbleListView;


});
