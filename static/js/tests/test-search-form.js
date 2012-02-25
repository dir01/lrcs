var FakeAutocomplete = function(options){
    this.bindAutocomplete = function(){};
    this.callback = options.callback;
};


module("Test SearchFormView", {
    setup: function() {
        this.form = $('<form id="search-box"><input id="id_query"></form>');
        this.input = this.form.find('#id_query');
        lrcs.views.FormSearchAutocomplete = FakeAutocomplete;
        this.track = new lrcs.models.Track;
        this.view = new lrcs.views.SearchFormView({el: this.form, model: this.track});
    }
});


test('Search input is updated according to track status', function(){
    this.track.set({artist: 'SomeArtist', title: 'SomeTitle'});
    equal('SomeArtist - SomeTitle', this.input.val());
    this.track.set({artist: '', title: ''});
    equal('', this.input.val());
});


test('When track is chosen in autocomplete, track_searched event is fired', function(){
    var eventArgs;
    var trackData = {artist: 'SomeArtist', title: 'SomeTitle'};
    this.view.bind('track_searched', function(args){ eventArgs = args; });
    this.view.autocomplete.callback(trackData);
    ok(new lrcs.models.Track(trackData).equals(eventArgs));
});
