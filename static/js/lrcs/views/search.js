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

            this.$input = this.$('input')
                .suggester({
                    autoSelectFirst: true,
                    fetch: this.fetch.bind(this),
                    parse: this.parse.bind(this),
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
            lrcs.lastfm.getTrackSearchQueryResults(query).done(done);
        },

        parse: function(items) {
            return _.map(items, this.createTrackStub);
        },

        renderItem: function(item) {
            var view = new lrcs.views.SearchResult({ model: item });
            return view.render().el;
        },
        
        select: function(item) {
            this.$input.val(item.toString());
            lrcs.dispatch.trigger('navigate:track', item);
        },

        createTrackStub: function(data) {
            return new lrcs.models.Track({
                artist: data.artist,
                title: data.title,
                image: data.image
            });
        }

    });

})(lrcs);