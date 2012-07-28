var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.Music = function() { this.initialize.apply(this, arguments); }
    lrcs.Music.prototype = {

        initialize: function(options) {
            this.lastfm = options.lastFm;
        },

        // query

        getAlbum: function(artist, title, callback) {
            this.lastfm.getAlbumInfo(
                artist, title,
                this.raiseAlbum.bind(this, callback)
            );
        },

        searchTracks: function(query, callback) {
            this.lastfm.queryTracks(
                query,
                this.raiseTracks.bind(this, callback)
            )
        },

        getTrack: function(artist, title, callback) {
            this.lastfm.getTrackInfo(
                artist, title,
                this.raiseTrack.bind(this, callback)
            );
        },

        // call back

        raiseAlbum: function(callback, data) {
            callback(this.createAlbumFromData(data));
        },

        raiseTracks: function(callback, data) {
            callback(this.createTracksFromListOfData(data));
        },

        raiseTrack: function(callback, data) {
            callback(this.createTrackFromData(data));
        },

        // create

        createAlbumFromData: function(data) {
            data.tracks = _.map(data.tracks, this.createTrackFromData);
            return new lrcs.models.Album(data);
        },

        createTracksFromListOfData: function(listOfData) {
            return _.map(listOfData, this.createTrackFromData)
        },

        createTrackFromData: function(data) {
            return new lrcs.models.Track(data);
        }

    };

})(lrcs);
