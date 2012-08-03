var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.AlbumTrack = Backbone.View.extend({

        tagName: 'li',

        events: {
            'click a': 'activate'
        },

        templateName: 'album-track-template',

        initialize: function() {
            this.template = lrcs.tools.template(this.templateName);
            this.model.on('change', this.render, this);
        },

        render: function() {
            this.$el.html(
                this.template(
                    this.model.toJSON()
                )
            );
            return this;
        },

        activate: function(event) {
            event.preventDefault();
            lrcs.dispatch.trigger('navigate:track', this.model);
        }

    });

})(lrcs);