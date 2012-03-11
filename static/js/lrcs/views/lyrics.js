
var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.LyricsView = Backbone.View.extend({

        lyrics: null,

        animationLength: 300, // ms

        initialize: function() {
            this.$text = this.$('#lyrics');
            this.$overlays = this.$('#overlays-box');
            this.$message = this.$('#message');
        },

        setLyrics: function(lyrics) {
            this.lyrics = lyrics;
            this.render();
        },

        invalidate: function() {
            this.showOverlay('loading');
        },

        render: function() {
            if (this.hasLyrics())
                this.renderLyrics();
            else
                this.renderEmpty();
        },

        renderLyrics: function() {
            this.hideAllOverlays();
            this.$text.html(this.getPrettyLyrics());
        },

        renderEmpty: function() {
            if (this.hasTrack())
                this.renderNoLyrics();
            else
                this.renderIntro();
        },

        renderNoLyrics: function() {
            var track = this.getTrack();
            this.renderMessage("No lyrics found for “" +
                track.get('title') + "” by " + track.get('artist') + ".");
        },

        renderIntro: function() {
            this.renderMessage("Nothing to see here <sub>yet.</sub>");
        },

        renderMessage: function(message) {
            this.showOverlay('message');
            this.$text.html('');
            this.$message.html(message);
        },

        hasLyrics: function() {
            return this.lyrics && !this.lyrics.isEmpty();
        },

        hasTrack: function() {
            return this.lyrics && this.lyrics.track;
        },

        getPrettyLyrics: function() {
            return this.lyrics.getPrettyText();
        },

        getTrack: function() {
            return this.lyrics.track;
        },

        /* Show overlays */

        showOverlay: function(overlay) {
            this.$overlays.show();
            this.hideAllOverlaysBut(overlay);
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

        hideAllOverlays: function() {
            var elements = this.getAllOverlayElements();
            this.hideOverlayByElement(element);
        },

        hideAllOverlaysBut: function(overlay) {
            var allElements = this.getAllOverlayElements();
                element = this.getOverlayElement(overlay);
            this.hideOverlayByElement(allElements.not(element));
        },

        hideOverlay: function(overlay) {
            var element = this.getOverlayElement(overlay);
            this.hideOverlayByElement(element);
        },

        hideOverlayByElement: function(element) {
            this.markOverlayElementHidden(element);
            this.hideOverlayElementDelayed(element);
        },

        markOverlayElementHidden: function(element) {
            element.removeClass('visible');
            if (this.hasNoVisibleOverlays())
                this.$overlays.removeClass('visible');
        },

        hideOverlayElementDelayed: function(element) {
            this.hideOverlayElementAfter(element, this.animationLength);
        },

        hideOverlayElementAfter: function(element, delay) {
            window.setTimeout(this.hideOverlayElement.bind(this, element), delay);
        },

        hideOverlayElement: function(element) {
            element.hide();
            if (this.hasNoVisibleOverlays())
                this.$overlays.hide();
        },

        hasNoVisibleOverlays: function() {
            var elements = this.getAllOverlayElements();
            return !elements.hasClass('visible');
        },

        getAllOverlayElements: function() {
            return this.$overlays.children();
        },

        getOverlayElement: function(overlay) {
            return this.$('#' + overlay + '-overlay');
        }

    });

})(lrcs);
