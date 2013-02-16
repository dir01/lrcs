define([
    'lib/backbone',
    'core/tools',
    'core/dispatch'
], function(Backbone, Tools, Dispatch) {

'use strict';


var LastFmRecentTrackView = Backbone.View.extend({

    tagName: 'li',

    events: {
        'click a': 'activate'
    },

    templateName: 'last-fm-track-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);

        this.track = options.track;

        this.listenTo(this.track, 'change', this.render);
    },

    render: function() {
        var templateVars = this.templateVars(),
            html = this.template(templateVars);
        this.$el.html(html);
        return this;
    },

    templateVars: function() {
        return {
            path: this.track.getPath(),
            artist: this.track.getArtist(),
            title: this.track.getTitle(),
            timePlayed: this.track.getTimePlayedString()
        }
    },

    activate: function(event) {
        event.preventDefault();
        Dispatch.visitTrack(this.track);
    }

});

return LastFmRecentTrackView;


});