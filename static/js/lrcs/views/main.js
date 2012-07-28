var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.Main = Backbone.View.extend({

        tagName: 'div',
        id: 'main',
        attributes: {
            role: 'main'
        },

        initialize: function() {
            this.lyrics = new lrcs.views.Lyrics;
            
            this.$el.append(
                this.lyrics.el
            );
        },

        setLyrics: function(lyricsModel) {
            this.lyrics.setModel(lyricsModel);
        }

    });

})(lrcs);