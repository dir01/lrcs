var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.SearchResult = Backbone.View.extend({

        tagName: 'li',

        events: {
            'click a': lrcs.tools.preventEvent
        },

        templateName: 'search-result-template',

        initialize: function(options) {
            this.template = lrcs.tools.template(this.templateName);
        },

        render: function(lyricsModel) {
            this.$el.html(
                this.template(
                    this.model.toJSON()
                )
            );
            return this;
        }

    });

})(lrcs);