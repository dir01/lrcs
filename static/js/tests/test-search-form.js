var FakeAutocomplete = function(options) { this.options = options; },
    fakeTemplate = function(a) { return a; }


module("SearchFormView", {
    setup: function() {
        this.form = $('<form id="search-box"><input id="id_query"></form>');
        this.input = this.form.find('#id_query');
        lrcs.views.FormSearchAutocomplete = FakeAutocomplete;
        lrcs.tools.template = fakeTemplate;
        this.track = new lrcs.models.Track;
        this.view = new lrcs.views.SearchFormView({ el: this.form });
    }
});


test('Search input is updated according to track status', function() {
    this.track.set({artist: 'SomeArtist', title: 'SomeTitle'});
    this.view.setTrack(this.track).render();
    equal(this.input.val(), 'SomeArtist - SomeTitle');
    this.track.set({artist: '', title: ''});
    this.view.setTrack(this.track).render();
    equal(this.input.val(), '');
});


test('When track is chosen in autocomplete, track-searched event is fired', function() {
    var eventArgs;
    var trackData = {artist: 'SomeArtist', title: 'SomeTitle'};
    this.view.bind('track-searched', function(args) {
        eventArgs = args;
    });
    this.view.autocomplete.options.callback(trackData);
    ok(new lrcs.models.Track(trackData).equals(eventArgs));
});
