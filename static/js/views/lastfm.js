define([
    'lib/jquery',
    'lib/underscore',
    'lib/backbone',
    'core/dispatch',
    'core/tools',
    'views/lastfm-controls',
    'views/lastfm-login-form'
], function($, _, Backbone, Dispatch, Tools, LastFmControlsView, LastFmLoginFormView) {

'use strict';


var USERNAME_COOKIE_NAME = 'last-fm-username',
    WATCHING_INTERVAL = 3000;


var LastFmView = Backbone.View.extend({

    tagName: 'div',
    id: 'last-fm',

    initialize: function() {
        var username = Tools.getCookie(USERNAME_COOKIE_NAME);
        if (username)
            this.logInto(username);
        else
            this.logout();
    },

    logInto: function(username) {
        this.stopListening();

        Tools.setCookie(USERNAME_COOKIE_NAME, username);
        this.username = username;

        var controlsView = new LastFmControlsView({ username: this.username });
        this.listenTo(controlsView, 'disconnect', this.logout);
        this.switchToView(controlsView);

        this.recentScrobbles = controlsView.getRecentScrobbles();
        this.listenTo(this.recentScrobbles, 'reset', this.navigateToLatestTrackIfNeeded);

        this.listenTo(Dispatch, Dispatch.NAVIGATE.TRACK_PAGE, this.toggleAutoloadingOnTrackChange);

        this.setAutoLoadNowPlaying(true);
        this.startWatching();
    },

    logout: function() {
        this.stopListening();

        Tools.clearCookie(USERNAME_COOKIE_NAME);
        if (this.username)
            delete this.username;

        var loginView = new LastFmLoginFormView();
        this.listenTo(loginView, 'connect', this.logInto);
        this.switchToView(loginView);

        this.setAutoLoadNowPlaying(false);
        this.stopWatching();
    },

    startWatching: function() {
        if (this.timer)
            return;
        this.timer = setInterval(this.pollScrobbles.bind(this), WATCHING_INTERVAL);
        this.pollScrobbles();
    },

    stopWatching: function() {
        if (this.timer) {
            clearInterval(this.timer);
            delete this.timer;
        }
    },

    pollScrobbles: function() {
        if (!this.isLoggedIn())
            return;

        this.recentScrobbles.fetch();
    },

    toggleAutoloadingOnTrackChange: function(track) {
        var scrobble = this.recentScrobbles.first();
        if (_.isUndefined(scrobble))
            return;
        var scrobbledTrack = scrobble.getTrack();
        this.setAutoLoadNowPlaying(scrobble.isNowPlaying() && track.isEqualTo(scrobbledTrack));
    },

    navigateToLatestTrackIfNeeded: function() {
        var scrobble = this.recentScrobbles.first();
        var track = scrobble.getTrack();
        if (this.autoLoadNowPlaying && scrobble.isNowPlaying()) {
            // FIXME: We pretty much re-visit active track every tick of updating scrobbles
            // I'm not sure if that's bad or not, but it's _some_ sort of an overhead
            Dispatch.visitTrack(track);
        }
    },

    switchToView: function(view) {
        if (this.activeView)
            this.activeView.remove();
        this.activeView = view;
        view.render();
        this.$el.append(view.el);
    },

    expand: function() {
        this.$el.removeClass('collapsed');
    },

    collapse: function() {
        this.$el.addClass('collapsed');
        if (!this.isLoggedIn())
            this.activeView.collapse();
    },

    setAutoLoadNowPlaying: function(autoLoadNowPlaying) {
        this.autoLoadNowPlaying = autoLoadNowPlaying;
    },

    isLoggedIn: function() {
        return Boolean(this.username);
    }

});

return LastFmView;


});