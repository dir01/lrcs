var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.Main = Backbone.View.extend({

        tagName: 'div',
        id: 'main',

        views: {},

        initialize: function() {
            this.views.lyrics = new lrcs.views.Lyrics;
            this.views.album = new lrcs.views.Album;

            this.$el.append(
                this.views.lyrics.el,
                this.views.album.el
            );
        },

        setModel: function(track) {
            var oldTrack = this.model;

            if (track.isEqualTo(oldTrack))
                return;

            if (track.isStub()) {
                track.fetch().then(this.setModel.bind(this, track));
                return;
            }

            this.model = track;

            this.updateLyrics();
            if (track.hasAlbum() && !track.hasSameAlbumAs(oldTrack))
                this.updateAlbum();

            this.render();
        },

        updateLyrics: function() {
            var lyrics = this.model.lyrics();
            this.views.lyrics.setModel(lyrics);
        },

        updateAlbum: function() {
            var album = this.model.album();
            this.views.album.setModel(album);
        },

        render: function() {
            if (!this.model.hasAlbum())
                this.views.album.hide();
            else
                this.views.album.show();
        },

        hide: function() {
            this.$el.hide();
        },

        show: function() {
            this.$el.show();
        }

    });

})(lrcs);