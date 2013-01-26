var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.App = Backbone.Router.extend({

        title: 'Lyri.sk',

        routes: {
            '': 'visitIndex',
            ':artist/:title': 'visitTrackPage',
        },

        views: {},

        initialize: function() {
            lrcs.lastfm.initialize({ apiKey: lrcs.tools.getMeta('last-fm-api-key') });
            lrcs.dispatch = _.clone(Backbone.Events);

            lrcs.dispatch.on('navigate:index', this.showIndex, this);
            lrcs.dispatch.on('navigate:track', this.showTrack, this);

            this.$el = $('#content');
            this.$title = $('title');
            this.$body = $('body');

            $('#logo a').click(this.logoClicked.bind(this));

            this.views.search = new lrcs.views.Search;
            this.views.lastfm = new lrcs.views.LastFm;
            this.views.main = new lrcs.views.Main;

            this.$el.append(
                this.views.search.el,
                this.views.lastfm.el,
                this.views.main.el
            );
        },

        logoClicked: function(event) {
            event.preventDefault();
            this.visitIndex();
        },

        visitIndex: function() {
            lrcs.dispatch.trigger('navigate:index');
        },

        visitTrackPage: function(artist, title) {
            var track = new lrcs.models.Track({
                artist: lrcs.tools.decodeURIPart(artist),
                title: lrcs.tools.decodeURIPart(title)
            });
            lrcs.dispatch.trigger('navigate:track', track, true);
        },

        showIndex: function() {
            this.navigate('/');

            this.views.main.hide();
            this.views.lastfm.expand();

            this.$title.text(this.title);
            this.$body.addClass('index');
        },

        showTrack: function(track, dontNavigate) {
            if (!dontNavigate)
                this.navigate(track.path())

            this.views.main.setModel(track);
            this.views.main.show();
            this.views.lastfm.setAutoLoadNowPlaying(track.isNowPlaying());
            this.views.lastfm.collapse();

            this.$title.text(track.toString() + ' at ' + this.title);
            this.$body.removeClass('index');
        }
    
    });

})(lrcs);

