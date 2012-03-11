
var lrcs = lrcs || {};
lrcs.views = lrcs.views || {};

(function(lrcs) {

    lrcs.views.SidebarView = Backbone.View.extend({

        album: null,
        track: null,

        events: {
            'click #tracklist li a': 'triggerTrackClicked'
        },

        invalidate: function() {
            this.displayLoadingIndicator();
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
        },

        hideLoadingIndicator: function() {
            this.$el.removeClass('loading');
        }

    });

})(lrcs);
