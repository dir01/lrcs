
var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.LastFmAPIAdapter = function(options) {
        this.options = _.extend(this.options, options);
        this.api = this.getLastFmApi();
    }

    lrcs.LastFmAPIAdapter.prototype = {

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

        getTrackInfo: function(artist, title, callback) {
            this.api.track.getInfo({
                artist: artist,
                track: title
            }, {
                success: this.processTrackInfoResult.bind(this, callback)
            });
        },

        getAlbumInfo: function(artist, title, callback) {
            this.api.album.getInfo({
                artist: artist,
                album: title
            }, {
                success: this.processAlbumInfoResult.bind(this, callback)
            });
        },

        proccessTracksQueryResults: function(callback, data) {
            if (typeof data.results.trackmatches.track === 'undefined')
                var tracks = [];
            else
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

        processTrackInfoResult: function(callback, data) {
            var track = LastFmTrack.fromDetailedTrackData(data.track);
            callback(track)
        },

        processAlbumInfoResult: function(callback, data) {
            var album = LastFmAlbum.fromAlbumInfo(data.album);
            callback(album)
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


    var LastFmAlbum = function(data) {
        this.data = _.clone(data);
    }

    LastFmAlbum.fromAlbumInfo = function(info) {
        return new LastFmAlbum(info);
    }

    LastFmAlbum.prototype = {

        toJSON: function() {
            return {
                artist: this.getArtist(),
                title: this.getTitle(),
                largestImage: this.getLargestImage(),
                tracks: _.map(this.getTracks(), function(track) {
                    return track.toJSON()
                })
            }
        },

        getArtist: function() {
            return this.data.artist;
        },

        getTitle: function() {
            return this.data.name;
        },

        getLargestImage: function() {
            var largestImageIndex = this.data.image.length - 1;
            return this.getImage(largestImageIndex);
        },

        getImage: function(index) {
            return this.data.image[index]['#text'];
        },

        getTracks: function() {
            var tracklist = this.data.tracks.track;
            // sometimes, tracks.track is one single element, sanitize that
            if (!_.isArray(tracklist))
                if (tracklist)
                    tracklist = [tracklist];
                else
                    return [];
            return _.map(
                tracklist,
                this.createPlaylistItemFromTrackData.bind(this)
            );
        },

        createPlaylistItemFromTrackData: function(data) {
            var data = _.clone(data);
            data.album = this.getTitle();
            data.artist = this.getArtist();
            return LastFmTrack.fromTrackData(data);
        }

    }


    var LastFmTrack = function(data) {
        this.data = _.clone(data);
    }

    LastFmTrack.fromTrackData = function(data) {
        return new LastFmTrack(data);
    }

    LastFmTrack.fromDetailedTrackData = function(data) {
        var data = _.clone(data);
        data.artist = data.artist.name;
        if (data.album) {
            data.image = data.album.image;
            data.album = data.album.title;
        }
        return new LastFmTrack(data)
    }

    LastFmTrack.prototype = {

        toJSON: function() {
            return {
                artist: this.getArtist(),
                title: this.getTitle(),
                album: this.getAlbum(),
                image: this.getImage(),
                isNowPlaying: this.isNowPlaying()
            }
        },

        getArtist: function() {
            if (typeof this.data.artist == 'string')
                return this.data.artist;
            return this.data.artist['#text'];
        },

        getTitle: function() {
            return this.data.name;
        },

        getAlbum: function() {
            return this.data.album;
        },

        getImage: function() {
            return this.data.image && this.data.image[0] && this.data.image[0]['#text'];
        },

        isNowPlaying: function() {
            return Boolean(this.data['@attr'] && this.data['@attr'].nowplaying == 'true')
        }

    }

})(lrcs);
