
var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.LyricsView = Backbone.View.extend({

        lyrics: null,
        album: null,

        animationLength: 300, // ms

        initialize: function() {
            this.$text = this.$('#lyrics');
            this.$overlays = this.$('#overlays-box');
            this.$message = this.$('#message');
            this.$image = this.$('#lyrics-background-art');
        },

        setLyrics: function(lyrics) {
            this.lyrics = lyrics;
            this.render()
            this.hideLoadingIndicator();
        },

        render: function() {
            if (!this.lyrics)
                return this;
            else if (this.lyrics.isEmpty())
                this.renderNotFound();
            else
                this.renderLyrics();
            return this;
        },

        renderNotFound: function() {
            return this.renderMessage("No lyrics found for “" +
                    this.lyrics.track.get('title') + "” by " +
                    this.lyrics.track.get('artist') + ".")
        },

        renderMessage: function(message) {
            this.showOverlay('message');
            this.$text.html('');
            this.$message.html(message);
            return this;
        },

        renderLyrics: function(lyrics) {
            this.hideOverlay('message');
            this.$text.html(this.getPrettyLyrics());
            return this;
        },

        getPrettyLyrics: function() {
            return this.lyrics.getPrettyText();
        },

        displayLoadingIndicator: function() {
            this.hideOverlay('message');
            this.showOverlay('loading');
            return this;
        },

        hideLoadingIndicator: function() {
            this.hideOverlay('loading');
            return this;
        },

        /* Show overlays */

        showOverlay: function(overlay) {
            this.$overlays.show();
            this.showOverlayElement(overlay);
            this.markOverlayVisibleDelayed(overlay);
        },

        showOverlayElement: function(overlay) {
            this.getOverlayElement(overlay).show();
        },

        markOverlayVisibleDelayed: function(overlay) {
            window.setTimeout(this.markOverlayVisible.bind(this, overlay), 0);
        },

        markOverlayVisible: function(overlay) {
            this.$overlays.addClass('visible');
            this.getOverlayElement(overlay).addClass('visible');
        },

        /* Hide overlays */

        hideOverlay: function(overlay) {
            this.markOverlayHidden(overlay);
            this.hideOverlayElementDelayed(overlay);
        },

        markOverlayHidden: function(overlay) {
            this.getOverlayElement(overlay).removeClass('visible');
            if (this.hasNoVisibleOverlays())
                this.$overlays.removeClass('visible');
        },

        hideOverlayElementDelayed: function(overlay) {
            this.hideOverlayElementAfter(overlay, this.animationLength);
        },

        hideOverlayElementAfter: function(overlay, delay) {
            window.setTimeout(this.hideOverlayElement.bind(this, overlay), delay);
        },

        hideOverlayElement: function(overlay) {
            this.getOverlayElement(overlay).hide();
            if (this.hasNoVisibleOverlays())
                this.$overlays.hide();
        },

        hasNoVisibleOverlays: function() {
            var overlays = this.$overlays.children()
            return !overlays.hasClass('visible');
        },

        getOverlayElement: function(overlay) {
            return this.$('#' + overlay + '-overlay');
        }

    });


    lrcs.views.AlbumArtView = Backbone.View.extend({

        album: null,

        initialize: function() {
            this.$img = this.$('img');
        },

        setAlbum: function(album) {
            this.album = album;
            this.render();
        },

        render: function() {
            if (!this.album)
                return this.hide();

            var url = this.album.get('image'),
                hasImage = Boolean(url);
            if (hasImage)
                this.$img
                    .attr('src', url)
                    .one('load', this.show.bind(this));
            else
                this.hide();
        },

        show: function() {
            this.$img.css('opacity', 1);
        },

        hide: function() {
            this.$img.css('opacity', 0);
        },

        getImageURL: function() {
            return this.album.get('url');
        }

    });


    lrcs.views.SidebarView = Backbone.View.extend({

        album: null,
        track: null,

        events: {
            'click #tracklist li a': 'triggerTrackClicked'
        },

        setAlbum: function(album) {
            this.album = album;
            this.render();
            this.hideLoadingIndicator();
        },

        setTrack: function(track) {
            this.track = track;
            this.render();
        },

        render: function() {
            if (!this.album || this.album.isEmpty())
                this.renderEmpty();
            else
                this.renderTrackList();
            return this;
        },

        renderEmpty: function() {
            this.$el.addClass('hidden');
        },

        renderTrackList: function() {
            this.$el.html(this.renderTemplate());
            this.$el.removeClass('hidden');
        },

        renderTemplate: function() {
            var template = this.getTemplate(),
                context = this.getTemplateContext();
            return template(context);
        },

        getTemplate: function() {
            return this.options.template;
        },

        getTemplateContext: function() {
            var currentTrack = this.track,
                tracks = this.album.get('tracks');

            _.each(tracks, function(track) {
                track.current = track.equals(currentTrack);
            });

            return this.album.toJSON();
        },

        triggerTrackClicked: function(event) {
            event.preventDefault();
            this.trigger(
                'track-clicked',
                this.getTrackByHtmlElement(event.currentTarget)
            );
        },

        getTrackByHtmlElement: function(element) {
            var cid = $(element).attr('data-cid');
            return this.getElementByCid(this.album.get('tracks'), cid);
        },

        getElementByCid: function(elements, cid) {
            return _.detect(elements, function(element) {
                return element.cid === cid;
            });
        },

        displayLoadingIndicator: function() {
            this.$el.addClass('loading');
            return this;
        },

        hideLoadingIndicator: function() {
            this.$el.removeClass('loading');
            return this;
        }

    });


    lrcs.views.SearchFormView = Backbone.View.extend({

        track: null,

        events: {
            'submit': 'preventSubmit'
        },

        initialize: function() {
            this.$query = this.$('#id_query');
            this.bindAutocomplete();
        },

        setTrack: function(track) {
            this.track = track;
            this.render();
        },

        bindAutocomplete: function() {
            this.autocomplete = new lrcs.views.FormSearchAutocomplete({
                input: this.$query,
                template: lrcs.tools.template('autocomplete-item-template'),
                callback: this.selectTrack.bind(this)
            });
        },

        selectTrack: function(track) {
            if (!track.isEmpty())
                this.trigger('track-searched', track);
        },

        preventSubmit: function(event) {
            event.preventDefault();
        },

        render: function() {
            if (!this.track || this.track.isEmpty())
                this.renderEmpty();
            else
                this.renderQuery();
            return this;
        },

        renderEmpty: function() {
            this.$query.val('');
        },

        renderQuery: function() {
            this.$query.val(this.track.toString())
        }

    });


    lrcs.views.LastFmView = Backbone.View.extend({

        events: {
            'click a#lastfm-control': 'connect',
            'click #lastfm-disconnect': 'disconnect',
            'click #lastfm-stop-watching': 'stopWatching',
            'click #lastfm-start-watching': 'startWatching'
        },

        initialize: function() {
            var connector = this.getConnector();
            connector.bind('change:username', this.render, this);
            connector.bind('change:isWatching', this.render, this);
        },

        connect: function() {
            var connector = this.getConnector(),
                username = this.promptForUsername();
            if (username)
                connector.connectTo(username);
        },

        promptForUsername: function() {
            return prompt("Please enter your last.fm username so we can watch you");
        },

        disconnect: function() {
            this.getConnector().disconnect();
        },

        stopWatching: function() {
            this.getConnector().stopWatching();
        },

        startWatching: function() {
            this.getConnector().startWatching();
        },

        render: function() {
            $(this.el).html(this.renderTemplate());
        },

        renderTemplate: function() {
            var template = this.getTemplate(),
                context = this.getTemplateContext();
            return template(context);
        },

        getTemplate: function() {
            var connector = this.getConnector(),
                isWatching = connector.get('isWatching');

            if (!connector.isConnected())
                return this.options.disconnectedTemplate;
            if (isWatching)
                return this.options.watchingTemplate;
            return this.options.idleTemplate;
        },

        getTemplateContext: function() {
            var connector = this.getConnector();
            return {
                username: connector.get('username')
            };
        },

        getConnector: function() {
            return this.model;
        }

    });


    lrcs.views.FormSearchAutocomplete = function(options) {
        this.options = _.extend(this.defaults, options);

        this.options.input.suggester({
            autoSelectFirst: true,
            restrictToSuggestions: true,
            fetch: this.fetch.bind(this),
            parse: this.parse.bind(this),
            renderItem: this.renderItem.bind(this),
            select: this.select.bind(this)
        });
    }

    lrcs.views.FormSearchAutocomplete.prototype = {

        defaults: {
            input: null,
            callback: function(){}
        },

        fetch: function(query, done) {
            lrcs.music.searchTracks(query, done);
        },

        parse: function(response) {
            return _.invoke(response, 'toJSON');
        },

        renderItem: function(item) {
            return $(this.options.template(item));
        },

        select: function(item) {
            this.options.input.val(item.artist + ' - ' + item.title);
            lrcs.music.getTrack(
                item.artist,
                item.title,
                this.options.callback
            );
        }

    }


})(lrcs);
