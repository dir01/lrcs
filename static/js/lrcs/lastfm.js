
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

        getLastPlayedTrackInfo: function(username, callback){
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
            callback(Sanitize.trackListData(data.results.trackmatches.track))
        },

        processLastPlayedTrack: function(callback, data) {
            var tracks = Sanitize.array(data.recenttracks.track);
            callback(Sanitize.trackData(tracks[0]));
        },

        processTrackInfoResult: function(callback, data) {
            callback(Sanitize.trackData(data.track));
        },

        processAlbumInfoResult: function(callback, data) {
            callback(Sanitize.albumData(data.album));
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


    Sanitize = {

        albumData: function(data) {
            return new AlbumDataSanitizer(data).getJSON()
        },

        trackListData: function(data) {
            var dataList = Sanitize.array(data);
            return _.map(dataList, Sanitize.trackData);
        },

        trackData: function(data) {
            return new TrackDataSanitizer(data).getJSON()
        },

        array: function(supposedlyArray) {
            if (_.isArray(supposedlyArray))
                return supposedlyArray
            if (typeof supposedlyArray === 'undefined')
                return []
            return [supposedlyArray];
        }

    }


    function AlbumDataSanitizer(data) {
        this.data = _.clone(data);
    }

    AlbumDataSanitizer.prototype = {

        getJSON: function() {
            return {
                artist: this.getArtist(),
                title: this.getTitle(),
                image: this.getLargestImage(),
                tracks: this.getTracks()
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
            var tracks = Sanitize.trackListData(this.data.tracks.track);
            return _.map(tracks, this.addMissingTrackData.bind(this));
        },

        addMissingTrackData: function(data) {
            data.album = this.getTitle();
            return data;
        }

    }


    function TrackDataSanitizer(data) {
        this.data = _.clone(data);
    }

    TrackDataSanitizer.prototype = {

        getJSON: function() {
            return {
                title: this.getTitle(),
                artist: this.getArtist(),
                album: this.getAlbum(),
                image: this.getImage(),
                isNowPlaying: this.getIsNowPlaying()
            }
        },

        getTitle: function() {
            return this.data.name;
        },

        getArtist: function() {
            var artist = this.data.artist;
            if (typeof artist === 'object') {
                if (typeof artist.name === 'string')
                    return artist.name;
                if ('#text' in artist)
                    return artist['#text'];
            }
            return artist;
        },

        getAlbum: function() {
            var album = this.data.album;
            if (typeof album === 'object') {
                if (typeof album.title === 'string')
                    return album.title;
                if ('#text' in album)
                    return album['#text'];
            }
            return album;
        },

        getImage: function() {
            var image = this.data.image;
            if (typeof image === 'undefined')
                if (typeof this.data.album !== 'undefined')
                    image = this.data.image;
            return image && image[0] && image[0]['#text'];
        },

        getIsNowPlaying: function() {
            return Boolean(this.data['@attr'] && this.data['@attr'].nowplaying == 'true')
        }

    }


})(lrcs);
