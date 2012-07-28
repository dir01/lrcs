$(function() {

    var Router = Backbone.Router.extend({

        routes: {
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

            this.router = new Router();
            this.router.on('route:lyrics', this.loadLyrics, this);

            Backbone.history.start();
        },

        loadLyricsByTrack: function(track) {
            this.loadLyrics(
                track.artist(),
                track.title()
            );
        },

        loadLyrics: function(artist, title) {
            var lyrics = new lrcs.models.Lyrics({
                artist: artist,
                title: title
            });
            lyrics.fetch();
            this.main.setLyrics(lyrics);
            this.router.navigate(lyrics.path());
        }

    });

    var app = new AppView;

});
