define([
    'lib/underscore',
    'lib/backbone'
], function(_, Backbone) {

'use strict';


var modelsCache = {};


var CachedModel = Backbone.Model.extend({

    name: '',
    identifiers: [],

    constructor: function(attributes, options) {
        var cache = this.getCache();
        var id = this.getCacheId(attributes);

        if (!(id in cache)) {
            Backbone.Model.apply(this, arguments);
            cache[id] = this;
        }

        return cache[id];
    },

    getCache: function() {
        if (!this.name)
            throw new Error('CachedModels have to have a name to be able to be cached.')

        if (!(this.name in modelsCache))
            modelsCache[this.name] = {};
        return modelsCache[this.name]
    },

    getCacheId: function(attributes) {
        if (!(_.isArray(this.identifiers)) || this.identifiers.length == 0)
            throw new Error('CachedModels have to have identifiers or redefined getCacheId to rely on caching instances.');

        var idAttrs = [];
        for (var i = 0, identifier; identifier = this.identifiers[i++];)
            idAttrs.push(attributes[identifier]);
        return idAttrs.join('|');
    }

});

return CachedModel;


});