
var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function() {

    lrcs.views.LyricsView = Backbone.View.extend({

        lyrics: null,
        album: null,

        initialize: function() {
            this.$text = this.$('#lyrics-text');
            this.$image = this.$('#lyrics-background-art');
        },

        setLyrics: function(lyrics) {
            this.lyrics = lyrics;
            return this;
        },

        setAlbum: function(album) {
            this.album = album;
            return this;
        },

        render: function() {
            if (!this.lyrics || this.lyrics.isEmpty())
                this.renderEmpty();
            else
                this.renderLyrics();
            return this;
        },

        renderEmpty: function() {
            this.$el.addClass('nothing');
            this.$text.html('');
        },

        renderLyrics: function(lyrics) {
            this.$el.removeClass('nothing');
            this.$text.html(this.getPrettyLyrics());
        },

        renderImage: function() {
            var url = this.getImageURL();
            this.$image
                .attr('src', url)
                .css('opacity', Boolean(url) ? 1 : 0);
        },

        getPrettyLyrics: function() {
            return this.lyrics.getPrettyText();
        },

        getImageURL: function() {
            return this.album.get('image');
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


    lrcs.views.SidebarView = Backbone.View.extend({

        album: null,
        track: null,

        events: {
            'click #tracklist li': 'triggerTrackClicked'
        },

        setAlbum: function(album) {
            this.album = album;
            return this;
        },

        setTrack: function(track) {
            this.track = track;
            return this;
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
            return _.template(
                this.getTemplate(),
                this.getTemplateVariables()
            );
        },

        getTemplate: function() {
            return this.options.template.html();
        },

        getTemplateVariables: function() {
            var currentTrack = this.track,
                trackList = this.album.get('trackList');

            _.each(trackList, function(track) {
                track.current = track.equals(currentTrack);
            });

            return {
                artist: this.album.get('artist'),
                album: this.album.get('title'),
                cover: this.album.get('cover'),
                tracks: this.album.get('trackList')
            };
        },

        triggerTrackClicked: function(event) {
            this.trigger(
                'track-clicked',
                this.getTrackByHtmlElement(event.target)
            );
        },

        getTrackByHtmlElement: function(element) {
            var cid = $(element).attr('data-cid');
            return this.getElementByCid(this.album.get('trackList'), cid);
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

        initialize: function() {
            this.$query = this.$('#id_query');
            this.bindAutocomplete();
        },

        setTrack: function(track) {
            this.track = track;
            return this;
        },

        bindAutocomplete: function() {
            new lrcs.views.FormSearchAutocomplete({
                input: this.$query,
                callback: this.selectTrack.bind(this)
            });
        },

        selectTrack: function(data) {
            var track = new lrcs.models.Track(data);
            if (!track.isEmpty())
                this.trigger('track-searched', track);
        },

        render: function() {
            if (!this.track || this.track.isEmpty())
                this.renderEmpty();
            else
                this.renderQuery();
            return this;
        },

        renderEmpty: function() {
            this.$query
                .val('')
                .attr('placeholder', "Go type in track title and artist's name");
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
            lrcs.lastFM.getTrackInfo(
                track.getArtist(),
                track.getTitle(),
                this.processSelectedTrackInfo.bind(this)
            );
        },

        processSelectedTrackInfo: function(track) {
            this.options.callback(track.toJSON());
        },

        getItemTemplate: function() {
            return $('#autocomplete-item-template').html();
        }

    }


})(lrcs);
