define([
    'lib/jquery',
    'lib/backbone',
    'core/dispatch',
    'core/tools',
    'views/lastfm-controls',
    'views/lastfm-login-form'
], function($, Backbone, Dispatch, Tools, LastFmControlsView, LastFmLoginFormView) {

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

    navigateToLatestTrackIfNeeded: function() {
        var scrobble = this.recentScrobbles.first();
        var track = scrobble.getTrack();
        if (this.autoLoadNowPlaying && scrobble.isNowPlaying())
            Dispatch.visitTrack(track);
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