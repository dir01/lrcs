var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Lyrics = Backbone.Model.extend({

        url: function() {
            return '/lyrics?' + this.queryString();
        },

        queryString: function() {
            return $.param({
                artist: this.artist(),
                track: this.saneTrackName()
            });
        },

        isStub: function() {
            return !this.hasText();
        },

        prettyText: function() {
            return this._prettyText = this._prettyText || this.createPrettyText();
        },

        createPrettyText: function() {
            if (!this.hasText())
                return;
            var uglyText = this.text(),
                paragraphs = uglyText.split('\n\n'),
                filteredParagraphs = _.compact(paragraphs),
                taggedParagraphs = _.map(filteredParagraphs, function(item) {
                    return item.replace(/\n/g, '<br/>');
                }),
                prettyText = '<p>' + taggedParagraphs.join('</p><p>') + '</p>';
            return prettyText;
        },

        hasText: function() {
            return this.has('lyrics');
        },

        artist: function() {
            return this.get('artist');
        },

        saneTrackName: function() {
            return this.track()
                .replace(/\(feat\..+?\)/, '')
                .replace(/\(ft .+?\)/, '')
                .replace(/ft\. .+?/, '')
                .replace(/\(ft\. .+?\)/, '')
                .replace(/\s+/, '')
                .trim();
        },

        track: function() {
            return this.get('track');
        },

        text: function() {
            return this.get('lyrics');
        }

    });
    
})(lrcs);