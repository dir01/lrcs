var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.SearchResult = Backbone.View.extend({

        tagName: 'li',

        events: {
            'click a': lrcs.tools.preventEvent
        },

        templateName: 'search-result-template',

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
        }

    });

})(lrcs);