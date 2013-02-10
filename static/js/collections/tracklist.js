define([
	'lib/backbone',
	'models/track'
], function(Backbone, Track) {

'use strict';


var Tracklist = Backbone.Collection.extend({
    model: Track
});

return Tracklist;


});
