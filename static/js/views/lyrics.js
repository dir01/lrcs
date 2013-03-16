define([
    'lib/jquery',
    'lib/backbone',
    'core/tools',
], function($, Backbone, Tools) {

'use strict';


var LyricsView = Backbone.View.extend({

    tagName: 'article',
    id: 'lyrics',

    templateNames: {
        lyrics: 'lyrics-template',
        notFound: 'lyrics-not-found-template'
    },

    initialize: function() {
        this.templates = {};
        for (var name in this.templateNames)
            this.templates[name] = Tools.template(this.templateNames[name]);

        this.$waiter = this.createWaiter().appendTo(this.el);
        this.$container = this.createContainer().appendTo(this.el);
    },

    createWaiter: function() {
        return Tools.createWaiter();
    },

    createContainer: function() {
        return $('<div></div>');
    },

    setLyrics: function(lyrics) {
        this.stopListening();
        this.lyrics = lyrics;

        this.listenTo(this.lyrics, 'change', this.render);
        this.listenTo(this.lyrics, 'error', this.renderError);

        if (this.lyrics.isStub())
            this.lyrics.fetch();

        this.render();
    },

    render: function() {
        if (this.lyrics.isStub())
            this.setWaiting(true);
        else
            this.renderLyrics();
    },

    renderError: function() {
        this.renderTemplate(this.templates.notFound);
    },

    renderLyrics: function() {
        this.renderTemplate(this.templates.lyrics);
    },

    renderTemplate: function(template) {
        this.setWaiting(false);
        var templateVars = this.getTemplateVars(),
            html = template(templateVars);
        this.$container.html(html);
    },
    
    getTemplateVars: function() {
        return {
            artist: this.lyrics.getArtist(),
            title: this.lyrics.getTrackTitle(),
            lyrics: this.lyrics.getPrettyText()
        }
    },

    setWaiting: function(waiting) {
        this.$el.toggleClass('waiting', waiting);
    }

});

return LyricsView;


});