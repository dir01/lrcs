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
        }

    }

})(lrcs);
