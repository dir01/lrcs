'use strict';

require.config({

    shim: {
        'lib/jquery': {
            exports: 'jQuery'
        },

        'lib/moment': {
            exports: 'moment'
        },

        'lib/underscore': {
            exports: '_'
        },

        'lib/backbone': {
            deps: ['lib/jquery', 'lib/underscore'],
            exports: 'Backbone',
            init: function() {
                this._.noConflict();
                return this.Backbone.noConflict();
            }
        },

        'lib/lastfm.api': {
            deps: ['lib/md5'],
            exports: 'LastFM',
        },

        'lib/lastfm.api.cache': {
            exports: 'LastFMCache',
        },

        'lib/jquery.suggester': ['lib/jquery'],
        'lib/md5': [],

    }

});

require(['lib/jquery', 'lib/backbone', 'core/app'], function($, Backbone, App) {

    $(function() {

        var app = new App;
        Backbone.history.start({ pushState: true });

    });

});
