define([
    'lib/jquery',
    'lib/underscore',
    'lib/backbone'
], function($, _, Backbone) {

'use strict';


var Lyrics = Backbone.Model.extend({

    url: function() {
        return '/lyrics?' + this.getQueryString();
    },

    getQueryString: function() {
        // TODO: sanitize artist too
        return $.param({
            artist: this.getArtist(),
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
            paragraphs = uglyText.split('\n\n'),
            filteredParagraphs = _.compact(paragraphs),
            taggedParagraphs = _.map(filteredParagraphs, function(item) {
                return item.replace(/\n/g, '<br/>');
            }),
            prettyText = '<p>' + taggedParagraphs.join('</p><p>') + '</p>';

        return prettyText;
    },

    getSaneTrackTitle: function() {
        return this.getTrackTitle()
            .replace(/\([Ff]eat\..+?\)/, '')
            .replace(/\([Ff]t .+?\)/, '')
            .replace(/[Ff]t\. .+?/, '')
            .replace(/\([Ff]t\. .+?\)/, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
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