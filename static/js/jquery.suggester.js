
(function($) {

    KEYS = {
        UP: 38,
        DOWN: 40
    }

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
            selectedClass: 'selected',
            autoSelectFirst: true,
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

            this.$el.keydown(this.keyDown.bind(this));
            this.$el.keyup(this.keyUp.bind(this));
        },

        keyDown: function(event) {
            var key = event.keyCode;
            switch(key) {
                case KEYS.DOWN:
                    event.preventDefault();
                    this.selectNext();
                    break;
                case KEYS.UP:
                    event.preventDefault();
                    this.selectPrevious();
                    break;
            }
        },

        keyUp: function(event) {
            var key = event.keyCode;
            if (key === KEYS.DOWN || key === KEYS.UP)
                return

            var query = this.$el.val();
            if (query.length < this.options.minLength)
                this.hide();
            else
                this.ask(query);
        },

        selectNext: function() {
            var selected = this.findSelected(),
                next = selected.next();
            if (next.length) {
                selected.removeClass(this.options.selectedClass);
                next.addClass(this.options.selectedClass);
            }
        },

        selectPrevious: function() {
            var selected = this.findSelected(),
                previous = selected.prev();
            if (previous.length) {
                selected.removeClass(this.options.selectedClass);
                previous.addClass(this.options.selectedClass);
            }
        },

        findSelected: function() {
            return this.$container.find('.' + this.options.selectedClass);
        },

        ask: function(query) {
            this.fetch(query, this.respond.bind(this));
        },

        respond: function(response) {
            var results = this.parse(response);
            if (results.length === 0)
                return this.hide();

            var elements = $.map(results, this.createItemElement.bind(this)),
                container = this.renderContainer(elements);

            if (this.options.autoSelectFirst)
                $(elements[0]).addClass(this.options.selectedClass);

            this.$container
                .empty()
                .append(container);

            this.show();
        },

        createItemElement: function(item) {
            var element = this.renderItem(item);
            return element.data('item', item);
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

