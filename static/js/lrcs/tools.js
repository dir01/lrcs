
var lrcs = lrcs || {};
lrcs.tools = lrcs.tools || {};

(function() {

    lrcs.tools.template = function(name) {
        return _.template($('#' + name).html());
    }

})(lrcs);