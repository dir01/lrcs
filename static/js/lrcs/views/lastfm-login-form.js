var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.LastFmLoginForm = Backbone.View.extend({

        events: {
            'click #connect-last-fm': 'toggleConnectionForm',
            'submit #last-fm-connection-prompt': 'connectAccount'
        },

        templateName: 'last-fm-login-template',

        initialize: function() {
            this.template = lrcs.tools.template(this.templateName);
        },

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
            var username = this.usernameInput().val();
            this.trigger('connect', username);
        },

        render: function() {
            var html = this.template();
            this.$el.html(html);
        },

        expand: function() {
            return;
        },

        collapse: function() {
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
