var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.Search = Backbone.View.extend({

        tagName: 'form',
        id: 'search',

        templateName: 'search-template',

        initialize: function(options) {
            this.template = lrcs.tools.template(this.templateName);
            this.render();

            this.music = options.music;

            this.$input = this.$('input')
                .suggester({
                    autoSelectFirst: true,
                    fetch: this.fetch.bind(this),
                    renderItem: this.renderItem.bind(this),
                    select: this.select.bind(this)
                });

            this.$el.submit(lrcs.tools.preventEvent);
        },

        render: function(lyricsModel) {
            this.$el.html(
                this.template
            );
            return this;
        },

        fetch: function(query, done) {
            this.music.searchTracks(query, done);
        },

        renderItem: function(item) {
            var view = new lrcs.views.SearchResult({ model: item });
            return view.render().el;
        },
        
        select: function(item) {
            this.$input.val(item.toString());
            this.trigger('select', item);
        }

    });

})(lrcs);