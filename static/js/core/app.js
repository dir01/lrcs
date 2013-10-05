define([
    'lib/underscore',
    'lib/jquery',
    'lib/backbone',
    'core/router',
    'core/dispatch',
    'core/lastfm',
    'core/tools',
    'models/track',
    'views/search',
    'views/lastfm',
    'views/main'
], function(_, $, Backbone, Router, Dispatch, LastFm, Tools, Track, SearchView, LastFmView, MainView) {

'use strict';


var App = Backbone.View.extend({

    title: 'Lyri.sk',

    events: {
        'click #logo a': 'goToIndex'
    },

    views: {},

    initialize: function() {
        LastFm.initialize({ apiKey: Tools.getMeta('last-fm-api-key') });

        this.$content = this.$('#content');
        this.$title = this.$('title');
        this.$body = this.$('body');

        this.views.search = new SearchView;
        this.views.lastfm = new LastFmView;
        this.views.main = new MainView;

        this.$content.append(
            this.views.search.el,
            this.views.lastfm.el,
            this.views.main.el
        );

        this.listenTo(Dispatch, Dispatch.NAVIGATE.INDEX, this.showIndex);
        this.listenTo(Dispatch, Dispatch.NAVIGATE.TRACK_PAGE, this.showTrack);

        this.router = new Router();
        Backbone.history.start({ pushState: true });
    },

    goToIndex: function(event) {
        event.preventDefault();
        Dispatch.visitIndex();
    },

    showIndex: function() {
        this.views.main.hide();
        this.views.lastfm.expand();

        this.$title.text(this.title);
        this.$body.addClass('index');
    },

    showTrack: function(track) {
        this.views.main.setTrack(track);
        this.views.main.show();
        this.views.lastfm.collapse();

        this.$title.text(track.toString() + ' at ' + this.title);
        this.$body.removeClass('index');
    }

});

return App;


});
