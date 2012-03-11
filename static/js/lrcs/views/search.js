
var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.SearchFormView = Backbone.View.extend({

        track: null,

        events: {
            'submit': 'preventSubmit'
        },

        initialize: function() {
            this.$query = this.$('#id_query');
            this.bindAutocomplete();
        },

        setTrack: function(track) {
            this.track = track;
            this.render();
        },

        bindAutocomplete: function() {
            this.autocomplete = new lrcs.views.FormSearchAutocomplete({
                input: this.$query,
                template: lrcs.tools.template('autocomplete-item-template'),
                callback: this.selectTrack.bind(this)
            });
        },

        selectTrack: function(track) {
            if (!track.isEmpty())
                this.trigger('track-searched', track);
        },

        preventSubmit: function(event) {
            event.preventDefault();
        },

        render: function() {
            if (!this.track || this.track.isEmpty())
                this.renderEmpty();
            else
                this.renderQuery();
        },

        renderEmpty: function() {
            this.$query.val('');
        },

        renderQuery: function() {
            this.$query.val(this.track.toString())
        }

    });


    lrcs.views.FormSearchAutocomplete = function(options) {
        this.options = _.extend(this.defaults, options);

        this.options.input.suggester({
            autoSelectFirst: true,
            restrictToSuggestions: true,
            fetch: this.fetch.bind(this),
            parse: this.parse.bind(this),
            renderItem: this.renderItem.bind(this),
            select: this.select.bind(this)
        });
    }

    lrcs.views.FormSearchAutocomplete.prototype = {

        defaults: {
            input: null,
            callback: function(){}
        },

        fetch: function(query, done) {
            lrcs.music.searchTracks(query, done);
        },

        parse: function(response) {
            return _.invoke(response, 'toJSON');
        },

        renderItem: function(item) {
            return $(this.options.template(item));
        },

        select: function(item) {
            this.options.input.val(item.artist + ' - ' + item.title);
            lrcs.music.getTrack(
                item.artist,
                item.title,
                this.options.callback
            );
        }

    }

})(lrcs);
