var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    var ACCOUNT_COOKIE_NAME = 'last-fm-account',
        WATCHING_TIMEOUT = 3000;

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
            this.doAutoLoadLatest();
            this.renderConnected();
        },

        unsetAccount: function() {
            delete this.account;
            $.cookie(ACCOUNT_COOKIE_NAME, null);
            this.stopWatching();
            this.dontAutoLoadLatest();
            this.renderConnectionForm();
        },

        startWatching: function() {
            if (this.timer)
                return;
            this.timer = setTimeout(WATCHING_TIMEOUT, this.pollTracks.bind(this));
        },

        pollTracks: function() {
            lrcs.lastfm.getRecentTracksInfo(this.account, 1)
                .done(this.updateTracks.bind(this));
        },

        updateTracks: function(tracksInfoList) {
            var container = this.$('#last-fm-tracks');
            container.html('');
            _.each(tracksInfoList, function(trackInfo) {
                var track = new lrcs.models.Track(trackInfo),
                    view = new lrcs.views.LastFmRecentTrack({ model: track });
                view.render();
                container.append(view.el);
            })
        },

        stopWatching: function() {
            if (this.timer) {
                clearTimeout(this.timer);
                delete this.timer;
            }
        },

        doAutoLoadLatest: function() {
            this.autoLoadLatest = true;
        },

        dontAutoLoadLatest: function() {
            this.autoLoadLatest = false;
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
