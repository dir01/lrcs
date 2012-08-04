var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Album = Backbone.Model.extend({

        fetch: function() {
            return lrcs.lastfm.getAlbumInfo(
                this.artist(), this.title()
            ).done(
                this.set.bind(this),
                this.trigger.bind(this, 'error')
            );
        },

        isStub: function() {
            return !this.has('tracks') && !this.has('image');
        },

        isEmpty: function() {
            return !this.has('tracks') || this.get('tracks').length == 0
        },

        artist: function() {
            return this.get('artist');
        },

        title: function() {
            return this.get('title');
        },

        image: function() {
            return this.get('image');
        },

        tracklist: function() {
            return this._tracklist = this._tracklist || this.createTracklist();
        },

        createTracklist: function() {
            return new lrcs.collections.Tracklist(this.get('tracks'));
        }

    });

})(lrcs);