var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.tools = {

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
        }

    }

})(lrcs);
