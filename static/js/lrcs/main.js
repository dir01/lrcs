$(function() {

    var App = Backbone.View.extend({

        el: $('#content')[0],

        initialize: function() {
            this.main = new lrcs.views.Main;

            this.$el.append(
                this.main.el
            )
        },

        loadLyrics: function(artist, title) {
            var lyrics = new lrcs.models.Lyrics({
                artist: artist,
                title: title
            });
            lyrics.fetch();
            this.main.setLyrics(lyrics);
        }

    });

    var Router = Backbone.Router.extend({

        initialize: function(options) {
            this.app = options.app;
        },

        routes: {
            ':artist/:title': 'lyrics', 
        },

        lyrics: function(artist, title) {
            this.app.loadLyrics(artist, title);
        }

    });
    
    var app = new App(),
        router = new Router({ app: app });
    
    Backbone.history.start();

});

