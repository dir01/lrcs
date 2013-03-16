define([
    'lib/backbone',
    'core/tools'
], function(Backbone, Tools) {

'use strict';


var SearchResultView = Backbone.View.extend({

    tagName: 'li',

    events: {
        'click a': Tools.preventEvent
    },

    templateName: 'search-result-template',

    initialize: function(options) {
        this.template = Tools.template(this.templateName);

        this.track = options.track;

        this.listenTo(this.track, 'change', this.render);
    },

    render: function() {
        var templateVars = this.getTemplateVars(),
            html = this.template(templateVars);
        this.$el.html(html);
    },

    getTemplateVars: function() {
        return {
            artist: this.track.getArtist(),
            title: this.track.getTitle(),
            image: this.track.getImage(),
            path: this.track.getPath()
        };
    }

});

return SearchResultView;


});