
var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.lastfm = {

        defaults: {
            apiKey: null
        },

        initialize: function(options) {
            this.options = _.extend({}, this.defaults, options);
            this.api = this._createAPI();
        },

        /* Exposed interface */

        getLastPlayedTrackInfo: function(username) {
            return this.getRecentTracksInfo(username, 1).pipe(_.first);
        },

        getRecentTracksInfo: function(username, count) {
            var params = { user: username, limit: count };
            var dfdRecentTracks = this._call('user.getRecentTracks', params);
            return dfdRecentTracks.pipe(this._processRecentTracks.bind(this, count));
        },

        getTrackSearchQueryResults: function(query) {
            var params = { track: query };
            var dfdTrackSearch = this._call('track.search', params);
            return dfdTrackSearch.pipe(this._processTrackQueryResults.bind(this));
        },

        getTrackInfo: function(artist, title) {
            var data = { artist: artist, track: title };
            var dfdTrackInfo = this._call('track.getInfo', data);
            return dfdTrackInfo.pipe(this._processTrackInfo.bind(this));
        },

        getAlbumInfo: function(artist, title) {
            var params = { artist: artist, album: title };
            var dfdAlbumInfo = this._call('album.getInfo', params);
            return dfdAlbumInfo.pipe(this._processAlbumInfo.bind(this));
        },

        /* Process results */

        _processRecentTracks: function(count, data) {
            var sanitizedData = Sanitize.trackListData(data.recenttracks.track),
                theRightAmountOfData = sanitizedData.slice(0, count);
            return theRightAmountOfData;
        },

        _processTrackQueryResults: function(data) {
            return Sanitize.trackListData(data.results.trackmatches.track);
        },

        _processTrackInfo: function(data) {
            return Sanitize.trackData(data.track);
        },

        _processAlbumInfo: function(data) {
            return Sanitize.albumData(data.album);
        },

        /* Generic call function that uses jQuery.Deferred */

        _call: function(fdef, params) {
            var dfd = new $.Deferred(),
                classAndMethod = fdef.split('.'),
                justClass = classAndMethod[0],
                method = classAndMethod[1];
            this.api[justClass][method](params, {
                success: function(response) { dfd.resolve(response); },
                error: function(response) { dfd.reject(response); }
            });
            return dfd.promise();
        },

        _createAPI: function() {
            var cache = new LastFMCache();
            var lastfm = new LastFM({
                apiKey: this.options.apiKey,
                cache: cache
            });
            return lastfm;
        }

    }

    var Sanitize = {

        albumData: function(data) {
            return new AlbumDataSanitizer(data).getJSON();
        },

        trackListData: function(data) {
            var dataList = Sanitize._toArray(data);
            return _.map(dataList, Sanitize.trackData);
        },

        trackData: function(data) {
            return new TrackDataSanitizer(data).getJSON()
        },

        _toArray: function(supposedlyArray) {
            if (_.isArray(supposedlyArray))
                return supposedlyArray
            if (typeof supposedlyArray === 'undefined')
                return []
            return [supposedlyArray];
        }

    };


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
            data.albumArtist = this.getArtist();
            return data;
        }

    };


    function TrackDataSanitizer(data) {
        this.data = _.clone(data);
    }

    TrackDataSanitizer.prototype = {

        getJSON: function() {
            return {
                title: this.getTitle(),
                artist: this.getArtist(),
                album: this.getAlbum(),
                albumArtist: this.getAlbumArtist(),
                image: this.getImage(),
                isNowPlaying: this.getIsNowPlaying(),
                timePlayed: this.getTimePlayed()
            }
        },

        getTitle: function() {
            return this.data.name;
        },

        getAlbumArtist: function() {
            var album = this.data.album;
            if (typeof album === 'object')
                if (typeof album.artist === 'string')
                    return album.artist;
            return this.getArtist();
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
        },

        getTimePlayed: function() {
            var date = this.data.date;
            if (typeof date === 'undefined')
                return date;
            return date.uts ? Number(date.uts) : date.uts; 
        }

    }


})(lrcs);
