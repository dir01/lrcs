define([
    'lib/backbone',
    'core/tools',
    'core/dispatch'
], function(Backbone, Tools, Dispatch) {

'use strict';


var AlbumTrackView = Backbone.View.extend({

    tagName: 'li',

    events: {
        'click a': 'activate'
    },

    templateName: 'album-track-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);

        this.track = options.track;

        this.listenTo(this.track, 'change', this.render);
        this.listenTo(Dispatch, Dispatch.NAVIGATE.TRACK, this.changeActiveTrack);

        this.setActive(Boolean(options.active));
    },

    render: function() {
        var templateVars = this.getTemplateVars(),
            html = this.template(templateVars);
        this.$el.html(html);
    },

    getTemplateVars: function() {
        return {
            path: this.track.getPath(),
            title: this.track.getTitle()
        }
    },

    changeActiveTrack: function(activeTrack) {
        this.setActive(this.track.isEqualTo(activeTrack));
    },

    setActive: function(active) {
        this.$el.toggleClass('active', active)
    },

    activate: function(event) {
        event.preventDefault();
        Dispatch.visitTrack(this.track);
    }

});

return AlbumTrackView;


});
