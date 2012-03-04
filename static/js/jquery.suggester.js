
(function($) {

    KEYS = {
        UP: 38,
        DOWN: 40,
        ENTER: 13
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
            url: '',
            delay: 200,
            maxResults: 10,
            minLength: 2,
            className: 'suggestions',
            selectedClass: 'selected',
            autoSelectFirst: true
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
                case KEYS.ENTER:
                    event.preventDefault();
                    this.activate();
                    break;
            }
        },

        keyUp: function(event) {
            var key = event.keyCode;
            if (key === KEYS.DOWN || key === KEYS.UP || key === KEYS.ENTER)
                return;

            var query = this.getQuery();
            if (query.length < this.options.minLength)
                this.hide();
            else
                this.waitToAsk(query);
        },

        waitToAsk: function(query) {
            if (this.timer)
                window.clearTimeout(this.timer);
            this.timer = window.setTimeout(this.ask.bind(this, query), this.options.delay);
        },

        ask: function(query) {
            delete this.timer;
            this.fetch(query, this.respond.bind(this, query));
        },

        respond: function(query, response) {
            var currentQuery = this.getQuery();
            if (currentQuery !== query)
                return;

            var results = this.parse(response);
            if (results.length === 0)
                return this.hide();

            if (this.options.maxResults !== Infinity)
                results = results.slice(0, this.options.maxResults);

            var elements = $.map(results, this.createItemElement.bind(this)),
                container = this.renderContainer(elements);

            if (this.options.autoSelectFirst)
                $(elements[0]).addClass(this.options.selectedClass);

            this.$container
                .empty()
                .append(container);

            this.show();
        },

        activate: function() {
            var element = this.findSelected(),
                item = element.data('item');
            this.hide();
            this.select(item);
        },

        createItemElement: function(item) {
            var element = this.renderItem(item);
            return element.data('item', item);
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

        getQuery: function() {
            return this.$el.val();
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
        },

        select: function(item) {
            this.$el.val(item);
        }

    }


})(jQuery);

