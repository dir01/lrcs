var lrcs = lrcs || {};
lrcs.models = lrcs.models || {};

(function(lrcs) {

    lrcs.models.Lyrics = Backbone.Model.extend({

        toJSON: function() {
            return {
                artist: this.getArtist(),
                title: this.getTitle(),
                lyrics: this.getPrettyText()
            }
        },

        url: function() {
            return '/lyrics?' + this.getQueryString();
        },

        getQueryString: function() {
            return $.param({
                artist: this.getArtist(),
                track: this.getTitle()
            });
        },

        getPrettyText: function() {
            return this.prettyText = this.prettyText || this.createPrettyText();
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

        hasText: function() {
            return this.has('lyrics');
        },

        getArtist: function() {
            return this.get('artist');
        },

        getTitle: function() {
            return this.get('title');
        },

        getText: function() {
            return this.get('lyrics');
        }

    });
    
})(lrcs);