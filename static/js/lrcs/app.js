if (typeof lrcs === 'undefined') lrcs = {};


(function(){

    lrcs.App = Backbone.View.extend({
        initialize: function(){
            this.createModels();
            this.createViews();
            this.bindEvents();
            this.render();
        },

        createModels: function(){
            this.currentTrack = new lrcs.models.Track;
            this.currentAlbum = new lrcs.models.Album({track: this.currentTrack});
            this.currentLyrics = new lrcs.models.Lyrics({track: this.currentTrack});
            this.lastFmPoller = new lrcs.models.LastFmPoller;
        },

        createViews: function(){
            this.searchFormView = new lrcs.views.SearchFormView({
                el: $('#search-box'),
                model: this.currentTrack
            });
            this.sidebarView = new lrcs.views.SidebarView({
                el: $('#sidebar'),
                template: $('#sidebar_template'),
                model: this.currentAlbum
            });
            this.lyricsView = new lrcs.views.LyricsView({
                el: $('#lyrics-box'),
                model: this.currentLyrics,
                album: this.currentAlbum
            });
        },

        bindEvents: function(){
            this.searchFormView.bind('track_searched', this.onTrackSearched, this);
            this.sidebarView.bind('track_clicked', this.onTrackClicked, this);
            this.lastFmPoller.bind('change:track', this.onTrackChanged, this)
        },

        render: function(){
           this.searchFormView.render();
           this.sidebarView.render();
           this.lyricsView.render();
        },

        onTrackSearched: function(track){
            console.log('track searched')
            this.currentTrack.replaceWith(track);
        },

        onTrackClicked: function(track){
            console.log('track clicked')
            this.currentTrack.replaceWith(track);
        },

        onTrackChanged: function(poller){
            var track = poller.get('track');
            this.currentTrack.replaceWith(track);
        }

    });

    lrcs.lastFM = new LastFmAPIAdapter({
        apiKey: $('meta[name=last-fm-api-key]').attr('content')
    });

})();
