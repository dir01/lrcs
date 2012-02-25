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


test('disconnected template', function(){
    this.lastFmView.options.disconnectedTemplate = 'disconnected';
    equal('disconnected', this.lastFmView.getTemplate());
});


test('watching template', function(){
    this.lastFmConnector.connectTo('username');
    this.lastFmConnector.set({isWatching: true});
    this.lastFmView.options.watchingTemplate = 'watching';
    equal('watching', this.lastFmView.getTemplate());
    ok(_.isEqual({username: 'username'}, this.lastFmView.getTemplateVariables()));
});


test('idle template', function(){
    this.lastFmConnector.connectTo('username');
    this.lastFmConnector.set({isWatching: false});
    this.lastFmView.options.idleTemplate = 'idle';
    equal('idle', this.lastFmView.getTemplate());
    ok(_.isEqual({username: 'username'}, this.lastFmView.getTemplateVariables()));
});
