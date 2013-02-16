define([
    'lib/underscore',
    'lib/jquery',
    'lib/backbone',
    'core/dispatch',
    'core/lastfm',
    'core/tools',
    'models/track',
    'views/search',
    'views/lastfm',
    'views/main'
], function(_, $, Backbone, Dispatch, LastFm, Tools, Track, SearchView, LastFmView, MainView) {

'use strict';


var App = Backbone.Router.extend({

    title: 'Lyri.sk',

    routes: {
        '': 'visitIndex',
        ':artist/:title': 'visitTrackPage',
    },

    views: {},

    firstVisit: true,

    initialize: function() {
        LastFm.initialize({ apiKey: Tools.getMeta('last-fm-api-key') });

        Dispatch.on('navigate:index', this.showIndex, this);
        Dispatch.on('navigate:track', this.showTrack, this);

        this.$el = $('#content');
        this.$title = $('title');
        this.$body = $('body');

        $('#logo a').click(this.logoClicked.bind(this));

        this.views.search = new SearchView;
        this.views.lastfm = new LastFmView;
        this.views.main = new MainView;

        this.$el.append(
            this.views.search.el,
            this.views.lastfm.el,
            this.views.main.el
        );
    },

    logoClicked: function(event) {
        event.preventDefault();
        this.visitIndex();
    },

    visitIndex: function() {
        Dispatch.trigger('navigate:index');
    },

    visitTrackPage: function(artist, title) {
        var track = new Track({
            artist: Tools.decodeURIPart(artist),
            title: Tools.decodeURIPart(title)
        });
        Dispatch.trigger('navigate:track', track, true);
    },

    showIndex: function() {
        this.navigate('/');

        this.views.main.hide();
        this.views.lastfm.setAutoLoadNowPlaying(this.firstVisit);
        this.views.lastfm.expand();

        this.$title.text(this.title);
        this.$body.addClass('index');

        this.firstVisit = false;
    },

    showTrack: function(track, dontNavigate) {
        if (!dontNavigate)
            this.navigate(track.getPath())

        this.views.main.setTrack(track);
        this.views.main.show();
        this.views.lastfm.setAutoLoadNowPlaying(track.isNowPlaying());
        this.views.lastfm.collapse();

        this.$title.text(track.toString() + ' at ' + this.title);
        this.$body.removeClass('index');

        this.firstVisit = false;
    }

});

return App;


});
