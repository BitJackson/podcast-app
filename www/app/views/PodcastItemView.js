PodcastItemView = Backbone.View.extend({
    tagName: 'li',

    events:{
        'click a.playPause': 'playPause',
        'click a.queue': 'queueToggle',
    },

    initialize: function(){

        // Set up event listeners. The change backbone event
        // is raised when a property changes (like the checked field)

        this.listenTo(this.model, 'playing', this.render);
        this.listenTo(this.model, 'loading', this.loading);
        this.listenTo(this.model, 'change:playhead', this.playhead);
        this.listenTo(this.model, 'change:queued change:listened', this.render);
        this.render();
    },

    render: function(){
        // Create the HTML
        var percentCompleted = 0;
        if(this.model.get('playhead') != null && this.model.get('duration') != null && this.model.get('duration') != 0){
            percentCompleted = parseInt((this.model.get('playhead') / this.model.get('duration')) * 100);
            //console.log(this.model.get('playhead'), this.model.get('duration'), percentCompleted);
        }
        var template = this.template({
            podcast: this.model.podcast.attributes,
            episode: _.extend(
                this.model.attributes, 
                {
                    playing: (app.Player ? app.Player.isCurrentlyPlaying(this.model.get('id')) : false),
                    percentCompleted: percentCompleted
                }
            ),
        });


        this.$el.html(template);

        if(this.model.get('listened')){
            this.$el.addClass('listened');
        }

        // Returning the object is a good practice
        // that makes chaining possible
        return this;
    },

    loading: function(){
        this.$el.find('a.playPause').addClass('loading');
    },
    playhead: function(){
        //this.$el.find('.percentCompleted').text('('+parseInt((this.model.get('playhead') / this.model.get('duration')) * 100)+'%)');
        this.$el.find('.percentCompleted').css('width', parseInt((this.model.get('playhead') / this.model.get('duration')) * 100)+'%');
    },
    playPause: function(){
        this.model.playPause();
    },
    queueToggle: function(){
        this.model.queueToggle();
    },
});