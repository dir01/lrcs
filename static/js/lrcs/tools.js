var lrcs = lrcs || {};

(function(lrcs) {

    lrcs.tools = {

        template: function(name) {
            return _.template($('#' + name).html());
        }

    }

})(lrcs);
