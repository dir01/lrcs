var LastFmTrack = $.klass({
    initialize: function(data){
        this.data = $.extend({}, data);
    },

    getArtist: function(){
        if (typeof this.data.artist == 'string'){
            return this.data.artist;
        }
        return this.data.artist['#text'];
    },

    getTitle: function(){
        return this.data.name
    },

    getImage: function(){
        return this.data.image && this.data.image[0] && this.data.image[0]['#text'];
    },

    isNowPlaying: function(){
        return Boolean(this.data['@attr'] && this.data['@attr'].nowplaying == 'true')
    }
})

var LastFmAPIAdapter = $.klass({
    initialize: function(options){
        this.options = $.extend({
            apiKey: null
        }, options)
        this.lastFmAPI = this.getLastFmApi();
    },

    getLastPlayedTrack: function(username, callback){
        this.lastFmAPI.user.getRecentTracks({
            user: username,
            limit:1
            }, {
                success: this.processLastPlayedTrack.bind(this, callback)
            });
    },

    queryTracks: function(query, callback) {
        this.lastFmAPI.track.search({
            track: query
        }, {
            success: this.proccessTracksQueryResults.bind(this, callback)
        });
    },

    proccessTracksQueryResults: function(callback, data) {
        if (typeof data.results.trackmatches.track === 'undefined')
            return;
        var tracks = $.map(
            data.results.trackmatches.track,
            this.constructLastFmTrackFromTrackData
        );

        callback(tracks);
    },

    processLastPlayedTrack: function(callback, data) {
        var tracksData = data.recenttracks.track;
        if ($.isArray(tracksData))
            var trackData = tracksData[0];
        else
            var trackData = tracksData;
        var track = this.constructLastFmTrackFromTrackData(trackData);

        callback(track)
    },

    constructLastFmTrackFromTrackData: function(trackData) {
        return new LastFmTrack(trackData);
    },

    getLastFmApi: function(){
        var cache = new LastFMCache();
        var lastfm = new LastFM({
            apiKey: this.options.apiKey,
            cache: cache
        });
        return lastfm;
    }
});
