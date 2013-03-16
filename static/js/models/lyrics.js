define([
    'lib/jquery',
    'lib/underscore',
    'core/cached-model',
    'core/tools'
], function($, _, CachedModel, Tools) {

'use strict';


var Lyrics = CachedModel.extend({

    name: 'lyrics',
    identifiers: ['artist', 'track'],

    url: function() {
        return '/lyrics?' + this.getQueryString();
    },

    getQueryString: function() {
        return $.param({
            artist: this.getSaneArtist(),
            track: this.getSaneTrackTitle()
        });
    },

    isStub: function() {
        return !this.hasText();
    },

    getPrettyText: function() {
        return this._prettyText = this._prettyText || this.createPrettyText();
    },

    createPrettyText: function() {
        if (!this.hasText())
            return;

        var uglyText = this.getText(),
            textWithProperNewLines = uglyText.replace('\r', ''),
            paragraphs = textWithProperNewLines.split('\n\n'),
            filteredParagraphs = _.compact(paragraphs),
            taggedParagraphs = _.map(filteredParagraphs, function(paragraph) {
                var lines = paragraph.split('\n'),
                    trimmedLines = _.invoke(lines, 'trim'),
                    filteredLines = _.compact(trimmedLines);
                return filteredLines.join('<br/>');
            }),
            prettyText = '<p>' + taggedParagraphs.join('</p><p>') + '</p>';

        return prettyText;
    },

    getSaneArtist: function() {
        var artist = this.getArtist();
        artist = Tools.removeFeats(artist);
        return Tools.cleanSpaces(artist);
    },

    getSaneTrackTitle: function() {
        var trackTitle = this.getTrackTitle();
        trackTitle = Tools.removeFeats(trackTitle);
        trackTitle = Tools.removeExplicitness(trackTitle);
        return Tools.cleanSpaces(trackTitle);
    },

    hasText: function() {
        return this.has('lyrics');
    },

    getArtist: function() {
        return this.get('artist');
    },

    getTrackTitle: function() {
        return this.get('track');
    },

    getText: function() {
        return this.get('lyrics');
    }

}, {

    getForTrack: function(track) {
        return Lyrics.createFromTrack(track);
    },

    createFromTrack: function(track) {
        return new Lyrics({
            artist: track.getArtist(),
            track: track.getTitle()
        });
    }

});

return Lyrics;


});
