
var lrcs = lrcs || {};

(function() {

    function LastFmAPIAdapter(options) {
        this.options = _.extend(this.options, options);
        this.api = this.getLastFmApi();
    }

    LastFmAPIAdapter.prototype = {

        options: {
            apiKey: null
        },

        getLastPlayedTrack: function(username, callback){
            this.api.user.getRecentTracks({
                user: username,
                limit: 1
            }, {
                success: this.processLastPlayedTrack.bind(this, callback)
            });
        },

        queryTracks: function(query, callback) {
            this.api.track.search({
                track: query
            }, {
                success: this.proccessTracksQueryResults.bind(this, callback)
            });
        },

        proccessTracksQueryResults: function(callback, data) {
            if (typeof data.results.trackmatches.track === 'undefined')
                return;

            var tracks = _.map(
                data.results.trackmatches.track,
                LastFmTrack.fromTrackData
            );

            callback(tracks);
        },

        processLastPlayedTrack: function(callback, data) {
            var tracksData = data.recenttracks.track;
            if (_.isArray(tracksData))
                var trackData = tracksData[0];
            else
                var trackData = tracksData;
            var track = LastFmTrack.fromTrackData(trackData);

            callback(track);
        },

        getLastFmApi: function() {
            var cache = new LastFMCache();
            var lastfm = new LastFM({
                apiKey: this.options.apiKey,
                cache: cache
            });
            return lastfm;
        }

    }


    var LastFmTrack = function(data) {
        this.data = _.clone(data);
    }

    LastFmTrack.fromTrackData = function(data) {
        return new LastFmTrack(data);
    }

    LastFmTrack.prototype = {

        getArtist: function() {
            if (typeof this.data.artist == 'string')
                return this.data.artist;
            return this.data.artist['#text'];
        },

        getTitle: function() {
            return this.data.name
        },

        getImage: function() {
            return this.data.image && this.data.image[0] && this.data.image[0]['#text'];
        },

        isNowPlaying: function() {
            return Boolean(this.data['@attr'] && this.data['@attr'].nowplaying == 'true')
        }

    }


    /* Export */

    lrcs.LastFmAPIAdapter = LastFmAPIAdapter;

})(lrcs);
