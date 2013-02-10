define([
    'lib/underscore',
    'lib/jquery'
], function(_, $) {

'use strict';


var Tools = {

    template: function(name) {
        return _.template($('#' + name).html());
    },

    getMeta: function(name) {
        return $('meta[name=' + name + ']').attr('content');
    },

    preventEvent: function(event) {
        event.preventDefault();
    },

    encodeURIPart: function(string) {
        return string.split(' ').join('_');
    },

    decodeURIPart: function(string) {
        return decodeURIComponent(string).split('_').join(' ');
    },

    getCookie: function(key, options) {
        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decodeURIComponent(pair[0]) === key)
                return decodeURIComponent(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
    },

    clearCookie: function(key) {
        Tools.setCookie(key, null);
    },

    setCookie: function(key, value, options) {
        options = _.clone(options) || {};

        if (_.isNull(value) || _.isUndefined(value))
            options.expires = -1;

        if (_.isNumber(options.expires)) {
            var days = options.expires,
                t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path    ? '; path=' + options.path : '',
            options.domain  ? '; domain=' + options.domain : '',
            options.secure  ? '; secure' : ''
        ].join(''));
    }

}

return Tools;


});
