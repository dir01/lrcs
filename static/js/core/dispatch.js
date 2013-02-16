define([
    'lib/underscore',
    'lib/backbone'
], function(_, Backbone) {

'use strict';


var Dispatch = _.extend({}, Backbone.Events, {

	NAVIGATE: {
		INDEX: 'navigate:index',
		TRACK_PAGE: 'navigate:track'
	},

	visitIndex: function() {
		this.trigger(this.NAVIGATE.INDEX);
	},

	visitTrack: function(track) {
		this.trigger(this.NAVIGATE.TRACK_PAGE, track);
	}

});

return Dispatch;


});
