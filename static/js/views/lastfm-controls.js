define([
    'lib/backbone',
    'core/tools',
    'collections/lastfm-scrobble-list',
    'views/lastfm-scrobble-list'
], function(Backbone, Tools, LastFmScrobbleList, LastFmScrobbleListView) {

'use strict';


var NUMBER_OF_SCROBBLES_TO_SHOW = 15;


var LastFmControlsView = Backbone.View.extend({

    events: {
        'click #disconnect-last-fm': 'disconnectAccount'
    },

    views: {},

    templateName: 'last-fm-connected-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);

        this.username = options.username;

        this.recentScrobbles = new LastFmScrobbleList([], {
            username: this.username,
            number: NUMBER_OF_SCROBBLES_TO_SHOW
        });

        this.views.recentScrobbles = new LastFmScrobbleListView({ collection: this.recentScrobbles });
    },

    disconnectAccount: function(event) {
        event.preventDefault();
        this.trigger('disconnect');
    },

    render: function() {
        var templateVars = this.getTemplateVars(),
            html = this.template(templateVars);
        this.$el.html(html);
        this.$el.append(this.views.recentScrobbles.el);
    },

    getTemplateVars: function() {
        return {
            username: this.username
        };
    },

    getRecentScrobbles: function() {
        return this.recentScrobbles;
    }

});

return LastFmControlsView;


});
