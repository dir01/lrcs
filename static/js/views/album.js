define([
    'lib/jquery',
    'lib/underscore',
    'lib/backbone',
    'core/tools',
    'views/album-track'
], function($, _, Backbone, Tools, AlbumTrackView) {

'use strict';


var AlbumView = Backbone.View.extend({

    tagName: 'aside',
    id: 'album',

    templateName: 'album-template',

    initialize: function() {
        this.template = Tools.template(this.templateName);

        this.$waiter = this.createWaiter().appendTo(this.el);
        this.$container = this.createContainer().appendTo(this.el);

        this.hide();
    },

    createWaiter: function() {
        return Tools.createWaiter('small');
    },

    createContainer: function() {
        return $('<div></div>');
    },

    setAlbum: function(album) {
        this.stopListening();
        this.album = album;

        this.listenTo(this.album, 'change', this.render);

        if (this.album.isStub())
            this.album.fetch();

        this.render();
    },

    render: function() {
        if (this.album.isStub())
            this.setWaiting(true);
        else if (this.album.isEmpty())
            this.hide();
        else if (!this.isVisible()) {
            this.show();
            this.renderInsides();
        } else
            this.slideIn(
                this.renderUpdated.bind(this)
            );
    },

    renderUpdated: function() {
        this.renderInsides();
        this.slideOut(
            this.resetLeft.bind(this)
        );
    },

    renderInsides: function() {
        var templateVars = this.getTemplateVars(),
            html = this.template(templateVars);
        this.$container.html(html);
        this.setWaiting(false);
        this.updateTracklist(this.album.getTracklist());
    },

    updateTracklist: function(tracklist) {
        // TODO: move this into a separate view god damn it
        this.clear();
        tracklist.each(this.addTrack.bind(this));
    },

    clear: function() {
        _.invoke(this.trackViews, 'remove');
        this.trackViews = [];
    },

    addTrack: function(track) {
        var view = new AlbumTrackView({ track: track });
        view.render();

        this.$('ol').append(view.el);
        this.trackViews.push(view);
    },

    getTemplateVars: function() {
        return {
            image: this.album.getImage(),
            artist: this.album.getArtist(),
            title: this.album.getTitle()
        }
    },

    slideIn: function(next) {
        this.$el.animate({
            left: -250
        }, {
            duration: 250,
            complete: next
        });
    },

    slideOut: function(next) {
        this.$el.animate({
            left: 0
        }, {
            duration: 250,
            complete: next
        });
    },

    resetLeft: function() {
        this.$el.css('left', '');
    },

    isVisible: function() {
        return !this.$el.hasClass('hidden');
    },

    show: function() {
        this.$el.removeClass('hidden');
    },

    hide: function() {
        this.$el.addClass('hidden');
    },

    setWaiting: function(waiting) {
        this.$el.toggleClass('waiting', waiting)
    }

});

return AlbumView;


});
