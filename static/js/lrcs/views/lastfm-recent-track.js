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
            var html = this.template(this.model.toJSON());
            this.$el.html(html);
            return this;
        },

        activate: function(event) {
            event.preventDefault();
            lrcs.dispatch.trigger('navigate:track', this.model);
        }

    });

})(lrcs);