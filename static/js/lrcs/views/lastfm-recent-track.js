var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.LastFmRecentTrack = Backbone.View.extend({

        tagName: 'li',

        events: {
            'click a': 'activate'
        },

        templateName: 'last-fm-track-template',

        initialize: function() {
            this.template = lrcs.tools.template(this.templateName);

            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            var templateVars = this.templateVars(),
                html = this.template(templateVars);
            this.$el.html(html);
            return this;
        },

        templateVars: function() {
            return {
                path: this.model.path(),
                artist: this.model.artist(),
                title: this.model.title(),
                timePlayed: this.model.timePlayed()
            }
        },

        activate: function(event) {
            event.preventDefault();
            lrcs.dispatch.trigger('navigate:track', this.model);
        }

    });

})(lrcs);