define([
    'lib/underscore',
    'lib/backbone'
], function(_, Backbone) {

'use strict';


var CachedModel = Backbone.Model.extend({

    identifiers: [],
    __cache: {},

    constructor: function(attributes, options) {
        if (!(_.isArray(this.identifiers)) || this.identifiers.length == 0)
            throw new Error('CachedModels have to have identifiers to rely on caching instances.');

        var id = this.getCacheId(attributes);

        if (!(id in this.__cache)) {
            Backbone.Model.apply(this, arguments);
            this.__cache[id] = this;
        }

        console.log(this.__cache)

        return this.__cache[id];
    },

    getCacheId: function(attributes) {
        var idAttrs = [];
        for (var i = 0, identifier; identifier = this.identifiers[i++];)
            idAttrs.push(attributes[identifier]);
        return idAttrs.join('|');
    }

});

return CachedModel;


});