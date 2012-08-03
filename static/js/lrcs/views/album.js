var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.Album = Backbone.View.extend({

        tagName: 'aside',
        id: 'album',

        templateName: 'album-template',

        initialize: function() {
            this.template = lrcs.tools.template(this.templateName);
            this.hide();
        },

        setModel: function(newModel) {
            var oldModel = this.model;
            if (oldModel)
                oldModel.off('change', this.render, this);

            this.model = newModel;
            this.model.on('change', this.render, this);
            if (this.model.isStub())
                this.model.fetch();

            this.render();
        },

        render: function() {
            if (this.model.isStub()) {
                this.$el.addClass('waiting');
                return;
            }

            this.$el
                .removeClass('waiting')
                .html(
                    this.template(
                        this.templateVars()
                    )
                );
            this.model.tracklist()
                .each(
                    this.addTrack.bind(this)
                );
        },

        addTrack: function(track) {
            var view = new lrcs.views.AlbumTrack({ model: track });
            view.on('activate', this.select, this);
            this.$('ol')
                .append(
                    view.render().el
                );
        },

        templateVars: function() {
            return {
                image: this.model.image(),
                artist: this.model.artist(),
                title: this.model.title()
            }
        },

        show: function() {
            this.$el.removeClass('hidden');
        },

        hide: function() {
            this.$el.addClass('hidden');
        }

    });

})(lrcs);