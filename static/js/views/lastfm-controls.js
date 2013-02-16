define([
    'lib/backbone',
    'core/tools',
    'collections/lastfm-recent-tracklist',
    'views/lastfm-recent-tracklist'
], function(Backbone, Tools, LastFmRecentTracklist, LastFmRecentTracklistView) {

'use strict';


var NUMBER_OF_RECENT_TRACKS_TO_SHOW = 15;


var LastFmControlsView = Backbone.View.extend({

    events: {
        'click #disconnect-last-fm': 'disconnectAccount'
    },

    views: {},

    templateName: 'last-fm-connected-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);

        this.username = options.username;

        this.recentTracklist = new LastFmRecentTracklist([], {
            username: this.username,
            number: NUMBER_OF_RECENT_TRACKS_TO_SHOW
        });

        this.views.recentTracklist = new LastFmRecentTracklistView({ collection: this.recentTracklist });
    },

    disconnectAccount: function(event) {
        event.preventDefault();
        this.trigger('disconnect');
    },

    render: function() {
        var templateVars = this.getTemplateVars(),
            html = this.template(templateVars);
        this.$el.html(html);
        this.$el.append(this.views.recentTracklist.el);
    },

    getTemplateVars: function() {
        return {
            username: this.username
        };
    },

    getRecentTracklistCollection: function() {
        return this.recentTracklist;
    }

});

return LastFmControlsView;


});
