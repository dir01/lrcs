var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    var ACCOUNT_COOKIE_NAME = 'last-fm-account',
        WATCHING_INTERVAL = 3000;

    lrcs.views.LastFm = Backbone.View.extend({

        tagName: 'div',
        id: 'last-fm',

        events: {
            'click #connect-last-fm': 'toggleConnectionForm',
            'submit #last-fm-connection-prompt': 'connectAccount',
            'click #disconnect-last-fm': 'disconnectAccount'
        },

        templateNames: {
            logIn: 'last-fm-login-template',
            connected: 'last-fm-connected-template'
        },

        initialize: function() {
            this.templates = {};
            for (var name in this.templateNames)
                this.templates[name] = lrcs.tools.template(this.templateNames[name]);

            var account = $.cookie(ACCOUNT_COOKIE_NAME);
            if (account)
                this.setAccount(account);
            else
                this.renderConnectionForm();
        },

        // user actions

        toggleConnectionForm: function(event) {
            event.preventDefault();
            var form = this.connectionForm();
            form.toggleClass('active');
            this.connectButton().toggleClass('active');
            if (form.hasClass('active'))
                this.usernameInput().focus();
        },

        connectAccount: function(event) {
            event.preventDefault();
            this.setAccount(this.usernameInput().val());
        },

        disconnectAccount: function(event) {
            event.preventDefault();
            this.unsetAccount();
        },

        // actual logic

        setAccount: function(account) {
            this.account = account;
            $.cookie(ACCOUNT_COOKIE_NAME, account);
            this.startWatching();
            this.pollTracks();
            this.doAutoLoadNowPlaying();
            this.renderConnected();
        },

        unsetAccount: function() {
            delete this.account;
            $.cookie(ACCOUNT_COOKIE_NAME, null);
            this.stopWatching();
            this.dontAutoLoadNowPlaying();
            this.renderConnectionForm();
        },

        startWatching: function() {
            if (this.timer)
                return;
            this.timer = setInterval(this.pollTracks.bind(this), WATCHING_INTERVAL);
        },

        stopWatching: function() {
            if (this.timer) {
                clearInterval(this.timer);
                delete this.timer;
            }
        },

        pollTracks: function() {
            lrcs.lastfm.getRecentTracksInfo(this.account, 1)
                .done(this.updateTracks.bind(this));
        },

        updateTracks: function(tracksInfoList) {
            var tracklist = new lrcs.collections.Tracklist(tracksInfoList);
            this.$('#last-fm-tracks').empty();
            this.updateTracklist(tracklist);
            if (this.autoLoadNowPlaying) {
                var track = tracklist.first();
                if (track.isNowPlaying())
                    lrcs.dispatch.trigger('navigate:track', track);
            }
        },

        updateTracklist: function(tracklist) {
            this.clear();
            tracklist.each(this.addTrack.bind(this));
        },

        clear: function() {
            _.invoke(this.trackViews, 'remove');
            this.trackViews = [];
        },

        addTrack: function(track) {
            var view = new lrcs.views.LastFmRecentTrack({ model: track });
            view.render();

            this.$('#last-fm-tracks').append(view.el);
            this.trackViews.push(view);
        },

        doAutoLoadNowPlaying: function() {
            this.autoLoadNowPlaying = true;
        },

        dontAutoLoadNowPlaying: function() {
            this.autoLoadNowPlaying = false;
        },

        renderConnectionForm: function() {
            var html = this.templates.logIn()
            this.$el.html(html);
        },

        renderConnected: function() {
            var templateVars = this.templateVars(),
                html = this.templates.connected(templateVars);
            this.$el.html(html);
        },

        templateVars: function() {
            return {
                username: this.account
            }
        },

        setActive: function() {
            this.$el.addClass('active');
            this.connectButton().removeClass('active');
            this.connectionForm().removeClass('active');
        },

        setInactive: function() {
            this.$el.removeClass('active');
            this.connectButton().removeClass('active');
            this.connectionForm().removeClass('active');
        },

        connectionForm: function() {
            return this.$('#last-fm-connection-prompt');
        },

        usernameInput: function() {
            return this.$('#last-fm-username-prompt');
        },

        connectButton: function() {
            return this.$('#connect-last-fm');
        }

    });

})(lrcs);
