
(function($) {

    $.fn.suggester = function(options) {
        return this.each(function() {
            new Suggester(this, options);
        });
    }

    function Suggester(el, options) {
        this.initialize(el, options);
    }

    Suggester.prototype = {

        defaults: {
            minLength: 2,
            className: 'suggestions'
            url: ''
        },

        redefinableMethods: ['fetch', 'parse', 'renderContainer', 'renderItem', 'select'],

        initialize: function(el, options) {
            this.$el = $(el);
            this.options = $.extend(this.defaults, options);

            for (var i = 0, methodName; methodName = this.redefinableMethods[i++];)
                if (methodName in options)
                    this[methodName] = options[methodName]; // TODO: check if callable

            this.$el.keyup(this.start.bind(this));

            this.$container = $('<div></div')
                .appendTo(document.body)
                .addClass(this.options.className)
                .css({
                    position: 'absolute',
                    display: 'none'
                });
        },

        start: function() {
            var query = this.$el.val();
            if (query.length < this.options.minLength)
                return;
            this.fetch(query, this.show.bind(this));
        },

        show: function(response) {
            var results = this.parse(response),
                elements = $.map(results, this.renderItem.bind(this)),
                container = this.renderContainer(elements);

            var position = this.$el.offset(),
                height = this.$el.height();

            this.$container
                .empty()
                .append(container)
                .css({
                    left: position.left,
                    top: position.top + height
                })
                .show();
        },

        fetch: function(query, done) {
            $.ajax({
                url: this.options.url,
                data: query,
                dataType: 'json',
                success: done // # TODO error
            });
        },

        parse: function(response) {
            return response;
        },

        renderContainer: function(elements) {
            var element = $('<ul></ul>');
            $.each(elements, function(index, child) {
                element.append(child);
            });
            return element;
        },

        renderItem: function(item) {
            var element = $('<li></li>');
            return element.text(item);
        }

    }


})(jQuery);

