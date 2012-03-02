if (typeof lrcs === 'undefined') lrcs = {};
if (typeof lrcs.views === 'undefined') lrcs.views = {};


(function() {
    lrcs.views.LyricsView = Backbone.View.extend({
        initialize: function() {
            this.getLyrics().bind('change', this.renderLyrics, this);
            this.getLyrics().bind('loading', this.displayLoadingIndicator, this);
            this.getAlbum().bind('change', this.renderCover, this);
        },

        displayLoadingIndicator: function() {
            $(this.el).addClass('loading');
        },

        hideLoadingIndicator: function() {
            $(this.el).removeClass('loading');
        },

        renderLyrics: function() {
            this.hideLoadingIndicator();
            if (this.hasLyrics()) {
                $(this.el).removeClass('nothing');
                this.$('#lyrics-text').html(this.getLyrics().getPrettyText());
            } else {
                $(this.el).addClass('nothing');
                this.$('#lyrics-text').html('')
            }
        },

        hasLyrics: function() {
            return !this.getLyrics().isEmpty();
        },

        renderCover: function() {
            this.$('#lyrics-background-art').attr(
                'src',
                this.getAlbumCover()
            );
        },

        getLyrics: function() {
            return this.model;
        },

        getAlbum: function() {
            return this.options.album;
        },

        getAlbumCover: function() {
            return this.getAlbum().get('cover');
        }

    });


    lrcs.views.SidebarView = Backbone.View.extend({
        events: {
            'click #tracklist li': 'triggerTrackClicked'
        },

        initialize: function() {
            this.getAlbum().bind('change', this.render, this);
        },

        render: function() {
            if (this.getAlbum().isEmpty()) {
                $(this.el).addClass('hidden');
            } else {
                $(this.el).html(this.renderTemplate());
                $(this.el).removeClass('hidden');
            }
        },

        triggerTrackClicked: function(event) {
            this.trigger(
                'track_clicked',
                this.getTrackByHtmlElement(event.target)
            );
        },

        renderTemplate: function() {
            return _.template(
                this.getTemplate(),
                this.getTemplateVariables()
            );
        },

        getAlbum: function() {
            return this.model;
        },

        getTemplate: function() {
            return this.options.template.html();
        },

        getTemplateVariables: function() {
            return {
                artist: this.getAlbum().get('artist'),
                album: this.getAlbum().get('title'),
                cover: this.getAlbum().get('cover'),
                tracks: this.getAlbum().get('trackList')
            };
        },

        getTrackByHtmlElement: function(element) {
            var cid = $(element).attr('data-cid');
            return this.getElementByCid(this.getAlbum().get('trackList'), cid);
        },

        getElementByCid: function(elements, cid) {
            return _.detect(elements, function(element) {
                return element.cid === cid;
            });
        }
    });


    lrcs.views.SearchFormView = Backbone.View.extend({
        events: {
            'submit': 'triggerTrackSearched'
        },

        initialize: function() {
            this.currentSearchedTrack = new lrcs.models.Track;
            this.getTrack().bind('change', this.render, this);
            this.bindAutocomplete();
        },

        render: function() {
            if (this.getTrack().isEmpty()) {
                this.setStateEmpty();
            } else {
                this.updateInputs();
            }
        },

        updateInputs: function() {
            this.$('#id_query').val(this.getVisibleQuery())
        },

        triggerTrackSearched: function(event) {
            if (event)
                event.preventDefault();
            var track = this.getCurrentSearchedTrack();
            if (!track.isEmpty())
                this.trigger('track_searched', track);
        },

        getCurrentSearchedTrack: function() {
            return this.currentSearchedTrack;
        },

        setCurrentSearchedTrack: function(track) {
            this.currentSearchedTrack.replaceWith(track);
        },

        getVisibleQuery: function() {
            return [this.getArtistName(), this.getTrackTitle()].join(' - ');
        },

        getArtistName: function() {
            return this.getTrack().get('artist');
        },

        getTrackTitle: function() {
            return this.getTrack().get('title');
        },

        getTrack: function() {
            return this.model;
        },

        setStateEmpty: function() {
            this.el[0].reset();
            this.$('#id_query')
                .attr(
                'placeholder',
                "Go type in track title and artist's name"
            );
        },

        bindAutocomplete: function() {
            var that = this;
            this.autocomplete = new lrcs.views.FormSearchAutocomplete({
                input: this.$('#id_query'),
                callback: this.selectAutocompleteTrack.bind(this)
            });
        },

        selectAutocompleteTrack: function(trackData) {
            var track = new lrcs.models.Track(trackData);
            this.setCurrentSearchedTrack(track);
            this.triggerTrackSearched();
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
            return _.template(
                this.getTemplate(),
                this.getTemplateVariables()
            );
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

        getTemplateVariables: function() {
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

        this.options.input.autocomplete({
            html: true,
            minLength: 2,
            source: this.processRequest.bind(this),
            select: this.processSelection.bind(this)
        });
    }

    lrcs.views.FormSearchAutocomplete.prototype = {

        defaults: {
            input: null,
            callback: function(){}
        },

        processRequest: function(request, response) {
            lrcs.lastFM.queryTracks(
                request.term,
                this.processResponse.bind(this, response)
            );
        },

        processResponse: function(response, tracks) {
            response(this.processTracks(tracks));
        },

        processTracks: function(tracks) {
            return _.map(tracks, this.processTrack.bind(this));
        },

        processTrack: function(track) {
            var template = this.getItemTemplate(),
                html = _.template(template, track.toJSON());
                node = $(html);
            node.data('track', track);
            return {
                label: node,
                value: [track.getArtist(), track.getTitle()].join(' - ')
            }
        },

        processSelection: function(event, ui) {
            var track = ui.item.label.data('track');
            this.options.callback(track.toJSON());
        },

        getItemTemplate: function() {
            return $('#autocomplete-item-template').html();
        }

    }


})();
