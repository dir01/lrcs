var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.AlbumTrack = Backbone.View.extend({

        tagName: 'li',

        events: {
            'click a': 'activate'
        },

        templateName: 'album-track-template',

        initialize: function(options) {
            this.template = lrcs.tools.template(this.templateName);

            this.listenTo(this.model, 'change', this.render);
            this.listenTo(lrcs.dispatch, 'navigate:track', this.toggleActive);

            this.toggleActive(options.active ? this.model : null);
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
                title: this.model.title()
            }
        },

        toggleActive: function(activeTrack) {
            this.$el.toggleClass('active', this.model.isEqualTo(activeTrack));
        },

        activate: function(event) {
            event.preventDefault();
            lrcs.dispatch.trigger('navigate:track', this.model);
        }

    });

})(lrcs);