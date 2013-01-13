var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.Album = Backbone.View.extend({

        tagName: 'aside',
        id: 'album',

        templateName: 'album-template',

        initialize: function() {
            this.template = lrcs.tools.template(this.templateName);

            this.$container = $('<div></div>').appendTo(this.el);
            this.$waiter = this.createWaiter().appendTo(this.el);

            this.hide();
        },

        createWaiter: function() {
            var spinner = $('<div></div>')
                .addClass('spinner small');
            return $('<div></div>')
                .addClass('waiter')
                .append(spinner);
        },

        setModel: function(model) {
            this.stopListening();
            this.model = model;

            this.listenTo(this.model, 'change', this.render);
            if (this.model.isStub())
                this.model.fetch();

            this.render();
        },

        render: function() {
            if (this.model.isStub()) {
                this.$el.addClass('waiting');
                return;
            }

            if (this.model.isEmpty())
                this.hide();
            else if (!this.isVisible()) {
                this.show();
                this.renderInsides();
            } else
                this.slideIn(
                    this.renderUpdated.bind(this)
                );
        },

        renderUpdated: function() {
            this.renderInsides();
            this.slideOut(
                this.resetLeft.bind(this)
            );
        },

        renderInsides: function() {
            var templateVars = this.templateVars(),
                html = this.template(templateVars);
            this.$el.removeClass('waiting');
            this.$container.html(html);
            this.updateTracklist(this.model.tracklist());
        },

        updateTracklist: function(tracklist) {
            this.clear();
            tracklist.each(this.addTrack.bind(this));
        },

        clear: function() {
            _.invoke(this.trackViews, 'remove');
            this.trackViews = [];
        },

        addTrack: function(track) {
            var view = new lrcs.views.AlbumTrack({ model: track });
            view.render();

            this.$('ol').append(view.el);
            this.trackViews.push(view);
        },

        templateVars: function() {
            return {
                image: this.model.image(),
                artist: this.model.artist(),
                title: this.model.title()
            }
        },

        slideIn: function(next) {
            this.$el.animate({
                left: -250
            }, {
                duration: 250,
                complete: next
            });
        },

        slideOut: function(next) {
            this.$el.animate({
                left: 0
            }, {
                duration: 250,
                complete: next
            });
        },

        resetLeft: function() {
            this.$el.css('left', '');
        },

        isVisible: function() {
            return !this.$el.hasClass('hidden');
        },

        show: function() {
            this.$el.removeClass('hidden');
        },

        hide: function() {
            this.$el.addClass('hidden');
        }

    });

})(lrcs);