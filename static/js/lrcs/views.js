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
            var track = this.getCurrentSearchedTrack();
            if (!track.isEmpty()) {
                this.trigger('track_searched', track);
            }
            event.preventDefault();
        },

        getCurrentSearchedTrack: function() {
            return this.currentSearchedTrack;
        },

        setCurrentSearchedTrack: function(track) {
            this.currentSearchedTrack.replaceWith(track);
        },

        getTrack: function() {
            return this.model;
        },

        getArtistName: function() {
            return this.getTrack().get('artist');
        },

        getTrackTitle: function() {
            return this.getTrack().get('title');
        },

        getVisibleQuery: function() {
            return [this.getArtistName(), this.getTrackTitle()].join(' - ');
        },

        submitForm: function() {
            this.el.submit();
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
                callback: function(trackData) {
                    var track = new lrcs.models.Track(trackData);
                    that.setCurrentSearchedTrack(track);
                    that.submitForm();
                }
            });
            this.autocomplete.bindAutocomplete();
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
        this.input = options.input;
        this.onTrackSelected = options.callback;

        this.bindAutocomplete = function() {
            this.input.autocomplete({
                html: true,
                minLength: 2,
                source: this.processAutocompleteRequest.bind(this),
                select: this.processAutocompleteSelection.bind(this)
            });
        };

        this.processAutocompleteRequest = function(request, response) {
            var that = this;
            lrcs.lastFM.queryTracks(
                request.term,
                function(tracks) {
                    response(that.processAutocompleteTracks(tracks));
                }
            );
        };

        this.processAutocompleteTracks = function(tracks) {
            return $.map(tracks, this.processAutocompleteTrack.bind(this));
        };

        this.processAutocompleteTrack = function(track) {
            var item = this.getAutocompleteItemTemplate();
            var image = track.getImage();
            if (image) {
                item.find('img').attr('src', image);
            }
            item.find('.artist').html(track.getArtist());
            item.find('.track').html(track.getTitle());
            item.data('data', track);
            return {
                label: item,
                value: [track.getArtist(), track.getTitle()].join(' - ')
            }
        };

        this.processAutocompleteSelection = function(event, ui) {
            var track = ui.item.label.data('data');
            this.onTrackSelected({
                artist: track.getArtist(),
                title: track.getTitle()
            });
        };

        this.getAutocompleteItemTemplate = function() {
            return $('#item-template')
                .clone()
                .attr('id', '')
                .removeClass('hidden')
                .addClass('suggestion-item');
        };
    };


})();
