define([
    'lib/underscore',
    'lib/backbone',
    'core/tools',
    'core/lastfm',
    'core/dispatch',
    'models/track',
    'views/search-result',
    'lib/jquery.suggester'
], function(_, Backbone, Tools, LastFm, Dispatch, Track, SearchResultView) {

'use strict';


var SearchView = Backbone.View.extend({

    tagName: 'form',
    id: 'search',

    events: {
        'submit': Tools.preventEvent
    },

    templateName: 'search-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);
        this.render();

        this.$input = this.$('input')
            .suggester({
                autoSelectFirst: true,
                fetch: this.fetchResults.bind(this),
                parse: this.parseResults.bind(this),
                renderItem: this.renderItem.bind(this),
                select: this.selectItem.bind(this)
            });
    },

    render: function(lyricsModel) {
        var html = this.template();
        this.$el.html(html);
    },

    fetchResults: function(query, done) {
        LastFm.getTrackSearchQueryResults(query).done(done);
    },

    parseResults: function(itemsData) {
        return _.map(itemsData, this.createTrackStub);
    },

    renderItem: function(track) {
        var view = new SearchResultView({ track: track });
        view.render();
        return view.el;
    },
    
    selectItem: function(track) {
        this.$input.val(track.toString());
        Dispatch.trigger('navigate:track', track);
    },

    createTrackStub: function(data) {
        return new Track({
            artist: data.artist,
            title: data.title,
            image: data.image
        });
    }

});

return SearchView;


});