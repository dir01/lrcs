var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.App = Backbone.Router.extend({

        routes: {
            '': 'visitIndex',
            ':artist/:title': 'visitTrackPage',
        },

        views: {},

        initialize: function() {
            lrcs.lastfm.initialize({ apiKey: lrcs.tools.getMeta('last-fm-api-key') });
            lrcs.dispatch = _.clone(Backbone.Events);

            lrcs.dispatch.on('navigate:track', this.showTrack, this);

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

        visitIndex: function() {
            this.views.main.hide();
            this.views.lastfm.setInactive();
            this.$title.text('lyri.sk');
        },

        visitTrackPage: function(artist, title) {
            var track = new lrcs.models.Track({
                artist: lrcs.tools.decodeURIPart(artist),
                title: lrcs.tools.decodeURIPart(title)
            });
            this.showTrack(track);
        },

        showTrack: function(track) {
            this.navigate(track.path())
            this.views.main.setModel(track);
            this.views.main.show();
            this.views.lastfm.setActive();
            this.$title.text(track.toString());
        }
    
    });

})(lrcs);

