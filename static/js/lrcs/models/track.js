var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Track = Backbone.Model.extend({

        toString: function() {
            return this.artist() + ' - ' + this.title();
        },

        lyrics: function() {
            return this._lyrics = this._lyrics || this.createLyrics();
        },

        createLyrics: function() {
            return new lrcs.models.Lyrics({
                artist: this.artist(),
                title: this.title()
            })
        },

        artist: function() {
            return this.get('artist');
        },

        title: function() {
            return this.get('title');
        }

    });

})(lrcs);