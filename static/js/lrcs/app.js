var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.App = Backbone.Router.extend({

        routes: {
            '': 'index',
            ':artist/:title': 'track', 
        },

        views: {},

        initialize: function() {
            lrcs.lastfm.initialize({ apiKey: lrcs.tools.getMeta('last-fm-api-key') });
            lrcs.dispatch = _.clone(Backbone.Events);

            lrcs.dispatch.on('navigate:track', this.track, this);

            this.$el = $('#content');
            this.$title = $('title');

            this.views.search = new lrcs.views.Search;
            this.views.lastfm = new lrcs.views.LastFm;
            this.views.main = new lrcs.views.Main;

            this.$el.append(
                this.views.search.el,
                this.views.lastfm.el,
                this.views.main.el
            );
        },

        index: function() {
            this.views.main.hide();
            this.views.lastfm.setInactive();
            this.$title.text('lyri.sk');
        },

        track: function() {
            var track;
            if (arguments.length == 2)
                track = new lrcs.models.Track({
                    artist: lrcs.tools.decodeURIPart(arguments[0]),
                    title: lrcs.tools.decodeURIPart(arguments[1])
                });
            else
                track = arguments[0];

            this.navigate(track.path());
            this.views.main.setModel(track);
            this.views.main.show();
            this.views.lastfm.setActive();

            this.$title.text(track.toString());
        }
    
    });

})(lrcs);

