var Episode = Backbone.Model.extend({

  // Default attributes for an episode
  defaults: function() {
    return {
      id: episodeItems.nextID(),
      title: "Some episode title",
      datePublished: null,
      duration: null,
      playhead: 0,
      duration: 100,
      mp3: 'http://downloads.bbc.co.uk/podcasts/radio4/fricomedy/fricomedy_20130524-1859a.mp3',
      cached: false,
      listened: false,
      podcastID: null, // The ID of the parent podcast,
      queued: true,
      queuePosition: false
    };
  },

  initialize: function () {
    this.podcast = podcastItems.getByID(this.get('podcastID'));
    if(this.get('queued') == true){
      this.set('queuePosition', episodeItems.nextQueuePosition());
    }

    this.listenTo(this, 'change', this.cloudSave); // In future we'll need to be more specific.
  },

  cloudSave: function(){
    this.save();
  },

  playPause: function(){
      app.Player.playPause(this);
      this.trigger('change');
  },

  queueToggle: function(){
    this.set('queued', !this.get('queued'));
    if(this.get('queued') == false){
      this.set('queuePosition', false);
    }
  }
});