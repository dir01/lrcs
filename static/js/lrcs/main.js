$(function() {

    var Router = Backbone.Router.extend({

        routes: {
            '': 'index',
            ':artist/:title': 'lyrics', 
        }

    });

    var AppView = Backbone.View.extend({

        el: $('#content')[0],

        initialize: function() {
            this.lastfm = new lrcs.LastFmAPIAdapter({
                apiKey: lrcs.tools.getMeta('last-fm-api-key')
            });

            this.music = new lrcs.Music({
                lastFm: this.lastfm
            });

            this.search = new lrcs.views.Search({ music: this.music });
            this.search.on('select', this.loadLyricsByTrack, this);

            this.main = new lrcs.views.Main;

            this.$el.append(
                this.search.el,
                this.main.el
            );

            this.lyrics = this.main.lyrics;

            this.router = new Router();
            this.router.on('route:index', this.index, this);
            this.router.on('route:lyrics', this.loadLyrics, this);

            Backbone.history.start();
        },

        index: function() {
            this.main.hide();
        },

        loadLyrics: function(artist, title) {
            var track = new lrcs.models.Track({
                artist: artist,
                title: title
            });
            this.loadLyricsByTrack(track);
        },

        loadLyricsByTrack: function(track) {
            var lyrics = track.lyrics();
            this.main.show();
            this.lyrics.setModel(lyrics);
            this.router.navigate(lyrics.path());
        }

    });

    var app = new AppView;

});
