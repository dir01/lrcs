var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

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

            this.account = $.cookie('last-fm-account');

            if (this.account) {
                this.renderConnected();
            } else
                this.renderLogIn();
        },

        connectAccount: function(event) {
            event.preventDefault();
            this.setAccount(this.usernameInput().val());
        },

        setAccount: function(account) {
            this.account = account;
            $.cookie('last-fm-account', account);
            this.renderConnected();
        },

        disconnectAccount: function(event) {
            delete this.account;
            $.cookie('last-fm-account', null);
            this.renderLogIn();
        },

        renderLogIn: function() {
            this.$el.html(
                this.templates.logIn()
            );
            return this;
        },

        renderConnected: function() {
            this.$el.html(
                this.templates.connected(
                    this.templateVars()
                )
            );
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

        toggleConnectionForm: function(event) {
            event.preventDefault();
            var form = this.connectionForm();
            form.toggleClass('active');
            this.connectButton().toggleClass('active');
            if (form.hasClass('active'))
                this.usernameInput().focus();
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
