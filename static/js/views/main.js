define([
    'lib/backbone',
    'models/lyrics',
    'models/album',
    'views/lyrics',
    'views/album',
], function(Backbone, Lyrics, Album, LyricsView, AlbumView) {

'use strict';


var MainView = Backbone.View.extend({

    tagName: 'div',
    id: 'main',

    views: {},

    initialize: function() {
        this.views.lyrics = new LyricsView;
        this.views.album = new AlbumView;

        this.$el.append(
            this.views.lyrics.el,
            this.views.album.el
        );

        this.views.album.hide();
    },

    setTrack: function(track) {
        var oldTrack = this.track;
        if (track.isEqualTo(oldTrack))
            return;

        this.upcomingTrack = track;
        if (track.isStub())
            track.fetch().then(this.showTrack.bind(this, track));
        else
            this.showTrack(track);
    },

    showTrack: function(track) {
        if (track !== this.upcomingTrack)
            return;

        var oldTrack = this.track;
        this.track = track;

        this.updateLyrics();
        if (track.hasAlbum() && !track.hasSameAlbumAs(oldTrack))
            this.updateAlbum();

        this.render();
    },

    updateLyrics: function() {
        var lyrics = Lyrics.getForTrack(this.track);
        this.views.lyrics.setLyrics(lyrics);
    },

    updateAlbum: function() {
        var album = Album.getForTrack(this.track);
        this.views.album.setAlbum(album);
    },

    render: function() {
        if (!this.track.hasAlbum())
            this.views.album.hide();
    },

    hide: function() {
        this.$el.hide();
    },

    show: function() {
        this.$el.show();
    }

});

return MainView;


});
