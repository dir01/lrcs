if (typeof lrcs === 'undefined') lrcs = {};
if (typeof lrcs.models === 'undefined') lrcs.models = {};


(function(){

    lrcs.models.Track = Backbone.Model.extend({
        defaults: {
            artist: '',
            title: ''
        },

        isEmpty: function(){
            return !(
                this.get('artist') &&
                this.get('title')
            );
        },

        equals: function(track){
            return _.isEqual(this.toJSON(), track.toJSON());

        },
        replaceWith: function(track){
            this.set(track.toJSON());
        },

        getQueryString: function() {
            return $.param({
                artist: this.get('artist'),
                track: this.get('title')
            });
        }
    });


    lrcs.models.Album = Backbone.Model.extend({
        defaults: {
            track: new lrcs.models.Track,
            artist: '',
            title: '',
            cover: '',
            trackList: []
        },

        initialize: function(){
            this.bind('change', this.annotateTracksWithCurrentTrack, this);
            this.get('track').bind('change', this.reload, this);
        },

        url: function(){
           return [
               '/album/',
               this.get('track').getQueryString()
           ].join('?');
        },

        parse: function(response){
            response.trackList = _.map(response.trackList, function(trackTitle){
                return new lrcs.models.Track({
                    'artist': response.artist,
                    'title': trackTitle
                })
            }, this);
            return response;
        },

        reload: function(){
            console.log('reloading album')
            this.fetch();
        },

        annotateTracksWithCurrentTrack: function(){
            var currentTrack = this.get('track');
            _.each(this.get('trackList'), function(track){
                if (currentTrack.equals(track)){
                    track.current = true;
                } else {
                    track.current = false;
                }
            }, this);
        },

        isEmpty: function(){
            return !(
                this.get('artist') &&
                this.get('title') &&
                this.get('trackList')
            );
        }
    });


    lrcs.models.Lyrics = Backbone.Model.extend({
        defaults: {
            track: new lrcs.models.Track
        },

        initialize: function(){
            this.get('track').bind('change', this.reload, this);
        },

        url: function(){
            return [
                '/lyrics',
                this.get('track').getQueryString()
            ].join('?');
        },

        reload: function(){
            this.trigger('loading');
            this.fetch();
        },

        getPrettyText: function(){
            return this.get('lyrics');
        },

        isEmpty: function(){
            return !this.getPrettyText();
        }

    });


    lrcs.models.LastFmPoller = Backbone.Model.extend({
        delay: 10 * 1000, //10s

        defaults: {
            track: null,
            username: '',
            lastFmAPIAdapter: null
        },

        initialize: function(){
            this.start();
        },

        start: function() {
            if (this.timer)
                return;
            this.timer = window.setInterval(this.poll.bind(this), this.delay);
            this.poll(); // launch polling right away when starting
        },

        stop: function() {
            if (!this.timer)
                return;
            window.clearInterval(this.timer);
            delete this.timer;
        },

        poll: function(){
            this.get('lastFmAPIAdapter').getLastPlayedTrack(
                this.get('username'),
                this.setTrackIfTrackIsNowPlaying.bind(this)
            );
        },

        setTrackIfTrackIsNowPlaying: function(lastFmTrack){
            if (lastFmTrack.isNowPlaying())
                this.set({'track': this.constructTrackByLastFmTrack(lastFmTrack)});
        },

        constructTrackByLastFmTrack: function(lastFmTrack){
            return new lrcs.models.Track({
                artist: lastFmTrack.getArtist(),
                title: lastFmTrack.getTitle()
            });
        }

    });

})();
