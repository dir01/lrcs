var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.Lyrics = Backbone.View.extend({

        tagName: 'article',
        id: 'lyrics',

        templateNames: {
            lyrics: 'lyrics-template',
            notFound: 'lyrics-not-found-template'
        },

        initialize: function() {
            this.templates = {};
            for (var name in this.templateNames)
                this.templates[name] = lrcs.tools.template(this.templateNames[name]);

            this.$container = $('<div></div>').appendTo(this.el);
            this.$waiter = this.createWaiter().appendTo(this.el);
        },

        createWaiter: function() {
            var spinner = $('<div></div>')
                .addClass('spinner');
            return $('<div></div>')
                .addClass('waiter')
                .append(spinner);
        },

        setModel: function(model) {
            this.stopListening();
            this.model = model;

            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'error', this.renderError);

            if (this.model.isStub())
                this.model.fetch();

            this.render();
        },

        render: function() {
            if (this.model.hasText())
                this.renderWithTemplate(
                    this.templates.lyrics
                );
            else
                this.$el.addClass('waiting');
        },

        renderError: function() {
            this.renderWithTemplate(
                this.templates.notFound
            );
        },

        renderWithTemplate: function(template) {
            this.$el.removeClass('waiting');
            this.$container.html(
                template(
                    this.templateVars()
                )
            );
        },
        
        templateVars: function() {
            return {
                artist: this.model.artist(),
                title: this.model.track(),
                lyrics: this.model.prettyText()
            }
        }

    });

})(lrcs);