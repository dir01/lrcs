
var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.AlbumArtView = Backbone.View.extend({

        album: null,

        initialize: function() {
            this.$img = this.$('img');
        },

        invalidate: function() {
            this.hide();
        },

        setAlbum: function(album) {
            this.album = album;
            this.render();
        },

        render: function() {
            var url = this.getImageURL();
            if (url)
                this.$img
                    .attr('src', url)
                    .one('load', this.show.bind(this));
            else
                this.hide();
        },

        show: function() {
            this.$img.css('opacity', 1);
        },

        hide: function() {
            this.$img.css('opacity', 0);
        },

        getImageURL: function() {
            return this.album && this.album.get('image');
        }

    });

})(lrcs);
