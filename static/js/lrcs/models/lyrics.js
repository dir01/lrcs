var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Lyrics = Backbone.Model.extend({

        toJSON: function() {
            return {
                artist: this.artist(),
                title: this.title(),
                lyrics: this.prettyText()
            }
        },

        url: function() {
            return '/lyrics?' + this.queryString();
        },

        path: function() {
            return this.artist() + '/' + this.title();
        },

        queryString: function() {
            return $.param({
                artist: this.artist(),
                track: this.title()
            });
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

        title: function() {
            return this.get('title');
        },

        text: function() {
            return this.get('lyrics');
        }

    });
    
})(lrcs);