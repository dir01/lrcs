define([
    'lib/jquery',
    'lib/underscore',
    'lib/backbone',
    'core/tools',
    'views/album-header',
    'views/album-tracklist'
], function($, _, Backbone, Tools, AlbumHeaderView, AlbumTrackListView) {

'use strict';


var AlbumView = Backbone.View.extend({

    tagName: 'aside',
    id: 'album',

    views: {},

    initialize: function() {
        this.$waiter = this.createWaiter().appendTo(this.el);
        this.$container = this.createContainer().appendTo(this.el);

        this.views.header = new AlbumHeaderView();
        this.views.tracklist = new AlbumTrackListView();

        this.$container.append(
            this.views.header.el,
            this.views.tracklist.el
        );

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
        this.views.header.setAlbum(this.album);
        this.views.tracklist.setTracklist(this.album.getTracklist());
        this.setWaiting(false);
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
