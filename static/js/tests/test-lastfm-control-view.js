module('LastFmView', {
    setup: function(){
        this.controlBox = $('<div></div>');
        lrcs.models.LastFmConnector.prototype.poll = function(){};
        this.lastFmConnector = new lrcs.models.LastFmConnector;
        this.watchingTemplate = 'watchingTemplate';
        this.idleTemplate = $('idleTemplate');
        this.disconnectedTemplate = $('disconnectedTemplate');
        this.view = new lrcs.views.LastFmView({
            el: this.controlBox,
            model: this.lastFmConnector,
            watchingTemplate: this.watchingTemplate,
            idleTemplate: this.idleTemplate,
            disconnectedTemplate: this.disconnectedTemplate
        });
    }
});


test('clicking on connect connects connector', function(){
    this.view.promptForUsername = function(){ return 'username'; };
    $('<a id="lastfm-control">').appendTo(this.controlBox).click();
    ok(this.lastFmConnector.isConnected());
    ok(this.lastFmConnector.isWatching());
    equal('username', this.lastFmConnector.get('username'));
});
