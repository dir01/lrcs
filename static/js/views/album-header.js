define([
    'lib/backbone',
    'core/tools'
], function(Backbone, Tools) {

'use strict';


var AlbumHeaderView = Backbone.View.extend({

    templateName: 'album-header-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);

        if (options && options.album)
            this.setAlbum(options.album);
    },

    setAlbum: function(album) {
        this.album = album;
        this.render();
    },

    render: function() {
        var templateVars = this.getTemplateVars(),
            html = this.template(templateVars);
        this.$el.html(html);
    },

    getTemplateVars: function() {
        return {
            image: this.album.getImage(),
            artist: this.album.getArtist(),
            title: this.album.getTitle()
        }
    }

});

return AlbumHeaderView;


});
