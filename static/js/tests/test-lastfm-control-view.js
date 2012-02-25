module('LastFmView', {
    setup: function(){
        this.controlBox = $('<div></div>');
        lrcs.models.LastFmConnector.prototype.poll = function(){};
        lrcs.views.LastFmView.prototype.render = function(){};
        this.lastFmConnector = new lrcs.models.LastFmConnector;
        this.lastFmView = new lrcs.views.LastFmView({
            el: this.controlBox,
            model: this.lastFmConnector
        });
    }
});


test('connect', function(){
    this.lastFmView.promptForUsername = function(){ return 'username'; };
    this.lastFmView.connect();
    equal('username', this.lastFmConnector.get('username'));
});


test('disconnect', function(){
    this.lastFmConnector.connectTo('username');
    this.lastFmView.disconnect();
    ok(!this.lastFmConnector.isConnected());
    ok(!this.lastFmConnector.isWatching());
});
