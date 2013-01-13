var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.LastFmControls = Backbone.View.extend({

        events: {
            'click #disconnect-last-fm': 'disconnectAccount'
        },

        views: {},

        templateName: 'last-fm-connected-template',

        initialize: function(options) {
            this.template = lrcs.tools.template(this.templateName);

            this.username = options.username;

            this.recentTracklist = new lrcs.collections.LastFmRecentTracklist([], { username: this.username, number: 10 });
            this.views.recentTracklist = new lrcs.views.LastFmRecentTracklist({ collection: this.recentTracklist });
        },

        disconnectAccount: function(event) {
            event.preventDefault();
            this.trigger('disconnect');
        },

        render: function() {
            var templateVars = this.templateVars(),
                html = this.template(templateVars);
            this.$el.html(html);
            this.$el.append(this.views.recentTracklist.el);
        },

        templateVars: function() {
            return {
                username: this.username
            };
        },

        getRecentTracklistCollection: function() {
            return this.recentTracklist;
        }

    });

})(lrcs);
