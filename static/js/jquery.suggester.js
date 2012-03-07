
(function($) {

    var KEYS = {
        UP: 38,
        DOWN: 40,
        ENTER: 13,
        ESC: 27
    };

    $.fn.suggester = function(options) {
        return this.each(function() {
            new Suggester(this, options);
        });
    };

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
            autoSelectFirst: false,
            restrictToSuggestions: false
        },

        redefinableMethods: ['fetch', 'parse', 'renderContainer', 'renderItem', 'select'],

        initialize: function(el, options) {
            this.options = $.extend(this.defaults, options);

            for (var i = 0, methodName; methodName = this.redefinableMethods[i++];)
                if (methodName in options)
                    this[methodName] = options[methodName]; // TODO: check if callable

            this.$container = $('<div></div>')
                .appendTo(document.body)
                .addClass(this.options.className)
                .css({
                    position: 'absolute',
                    display: 'none',
                    'z-index': 9999
                });

            this.$el = $(el);
            this.$el.keydown(this.keyDown.bind(this));
            this.$el.keyup(this.keyUp.bind(this));
        },

        /* React to whatever's happening */

        keyDown: function(event) {
            if (!this.visible)
                return;
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
                case KEYS.ESC:
                    event.preventDefault();
                    this.hide();
                    break;
            }
        },

        keyUp: function(event) {
            var key = event.keyCode;
            if (key in KEYS) // keys that shouldn't trigger a query
                return;

            var query = this.getQuery();
            if (query.length < this.options.minLength)
                this.hide();
            else
                this.waitToAsk(query);
        },

        /* Main process of suggestions fetching, showing and activating */

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

            this.firstElement = $(elements[0]);
            if (this.options.autoSelectFirst || this.options.restrictToSuggestions)
                this.firstElement.addClass(this.options.selectedClass);

            this.$container
                .empty()
                .append(container);

            this.show();
        },

        activate: function() {
            var element = this.findSelected(),
                item = element.data('item');
            this.hide();
            if (element.length !== 0)
                this.select(item);
        },

        getQuery: function() {
            return this.$el.val();
        },

        /* Item elements */

        createItemElement: function(item) {
            var element = $(this.renderItem(item));

            element
                .data('item', item)
                .mouseenter(this.itemMouseEnter.bind(this))
                .click(this.itemClick.bind(this));

            if (!this.options.restrictToSuggestions)
                element.mouseleave(this.itemMouseLeave.bind(this));

            return element;
        },

        itemMouseEnter: function(event) {
            var selected = this.findSelected(),
                hovered = $(event.currentTarget);
            selected.removeClass(this.options.selectedClass);
            hovered.addClass(this.options.selectedClass);
        },

        itemMouseLeave: function(event) {
            this.findSelected().removeClass(this.options.selectedClass);
        },

        itemClick: function(event) {
            this.activate();
        },

        /* Selection woes */

        selectNext: function() {
            var selected = this.findSelected(),
                next = selected.length ? selected.next() : this.firstElement;
            if (next.length) {
                selected.removeClass(this.options.selectedClass);
                next.addClass(this.options.selectedClass);
            }
        },

        selectPrevious: function() {
            var selected = this.findSelected(),
                previous = selected.length ? selected.prev() : this.firstElement;
            if (previous.length) {
                selected.removeClass(this.options.selectedClass);
                previous.addClass(this.options.selectedClass);
            }
        },

        findSelected: function() {
            return this.$container.find('.' + this.options.selectedClass);
        },

        /* Visibility controls */

        show: function() {
            var position = this.$el.offset(),
                height = this.$el.outerHeight(),
                width = this.$el.outerWidth();

            this.visible = true;
            this.$container
                .width(width)
                .css({
                    left: position.left,
                    top: position.top + height
                })
                .show();
        },

        hide: function() {
            this.visible = false;
            this.$container
                .empty()
                .hide();
            delete this.firstElement;
        },

        /* User-redefinable methods with some sane default implementations */

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

