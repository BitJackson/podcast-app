EpisodeItemView = Backbone.View.extend({
    tagName: 'li',

    events:{
        'click a.playPause': 'playPause',
        'click a.queue': 'queueToggle',
    },

    initialize: function(){

        // Set up event listeners. The change backbone event
        // is raised when a property changes (like the checked field)

        this.listenTo(this.model, 'playing', this.render);
        this.render();
    },

    render: function(){
        // Create the HTML
        var template = this.template({
            playing: app.Player.isCurrentlyPlaying(this.model.get('id')), // Pull it from the player collection / model.
            queued: this.model.get('queued'), // Get from queue model.
            percentCompleted: parseInt((this.model.get('playhead') / this.model.get('duration')) * 100),
            episode_title: this.model.get('title'), 
            podcast_title: this.model.podcast.get('title')
        });

        this.$el.html(template);

        // Returning the object is a good practice
        // that makes chaining possible
        return this;
    },

    playPause: function(){
        this.model.playPause();
    },
    queueToggle: function(){
        this.model.queueToggle();
    },
});