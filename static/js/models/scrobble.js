define([
    'lib/moment',
    'lib/backbone',
    'models/track'
], function(Moment, Backbone, Track) {

'use strict';


var Scrobble = Backbone.Model.extend({

    initialize: function(attributes, options) {
        this.track = new Track(attributes);
    },

    getTrack: function() {
        return this.track;
    },

    isNowPlaying: function() {
        return this.get('isNowPlaying');
    },

    getTimePlayedString: function() {
        if (this.isNowPlaying())
            return "playing now";
        else {
            var timePlayed = this.getTimePlayed();
            if (timePlayed)
                return Moment.unix(timePlayed).fromNow();
        }
        return "never";
    },

    getTimePlayed: function() {
        return this.get('timePlayed');
    }

});

return Scrobble;


});
