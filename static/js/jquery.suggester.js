
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
            className: 'suggestions',
            url: ''
        },

        redefinableMethods: ['fetch', 'parse', 'renderContainer', 'renderItem', 'select'],

        initialize: function(el, options) {
            this.$el = $(el);
            this.options = $.extend(this.defaults, options);

            for (var i = 0, methodName; methodName = this.redefinableMethods[i++];)
                if (methodName in options)
                    this[methodName] = options[methodName]; // TODO: check if callable

            this.$container = $('<div></div')
                .appendTo(document.body)
                .addClass(this.options.className)
                .css({
                    position: 'absolute',
                    display: 'none',
                    'z-index': 9999
                });

            this.$el.keyup(this.keyUp.bind(this));
        },

        keyUp: function(event) {
            var query = this.$el.val();
            if (query.length < this.options.minLength)
                return this.hide();

            this.ask(query);
        },

        ask: function(query) {
            this.fetch(query, this.respond.bind(this));
        },

        respond: function(response) {
            var results = this.parse(response);
            if (results.length === 0)
                return this.hide();

            var elements = $.map(results, this.renderItem.bind(this)),
                container = this.renderContainer(elements);

            this.$container
                .empty()
                .append(container);

            this.show();
        },

        show: function() {
            var position = this.$el.offset(),
                height = this.$el.outerHeight(),
                width = this.$el.outerWidth();

            this.$container
                .width(width)
                .css({
                    left: position.left,
                    top: position.top + height
                })
                .show();
        },

        hide: function() {
            this.$container.hide();
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

