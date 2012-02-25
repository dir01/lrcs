var FakeAutocomplete = function(){
    this.bindAutocomplete = function(){

    };
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
