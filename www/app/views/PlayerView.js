PlayerView = Backbone.View.extend({
	currentlyPlaying: $("#currentlyPlaying"),
	player: $('#player'),
	model: null,

	initialize: function() {
		//this.as = audiojs.createAll();
		this.audioPlayer = document.getElementsByTagName('audio')[0];

		// TODO, add play pause buttons to the view.

		// Listeners so the model is updated.
        this.audioPlayer.addEventListener('timeupdate', this.currentTime);
        this.audioPlayer.addEventListener('loadedmetadata', this.loadedmetadata);
        this.audioPlayer.addEventListener('pause', this.pause);
        this.audioPlayer.addEventListener('playing', this.pause);
        this.audioPlayer.addEventListener('ended', this.ended);
        this.audioPlayer.addEventListener('canplay', this.canplay);
        this.audioPlayer.addEventListener('waiting', this.waiting);

        if(this.model != null){
        	this.render();
        }
	},

	render: function() {
		this.audioPlayer.src = this.model.get('mp3');
		this.audioPlayer.load();

		this.currentlyPlaying.html(this.template({
            playhead: this.model.get('playhead'),
            duration: this.model.get('duration'),
            title: this.model.get('title'), 
            titleEncoded: this.model.get('titleEncoded'),
            podcast_title: this.model.podcast.get('title'),
            podcast_feedUrlEncoded: this.model.podcast.get('feedUrlEncoded')
        }));

        this.model.trigger('loading');

        /* Some other API references we might want to use. */
        //this.audioPlayer.playbackRate=1.5; // For faster listening
        //this.audioPlayer.duration // The duration of the audio.
        //this.audioPlayer.ended // When it's over
        //this.audioPlayer.error
        //this.audioPlayer.currentTime // gets the current place of the audio.
        //this.audioPlayer.muted // if the audio is muted 
	},

	canplay: function(e){
		e.srcElement.currentTime = app.Player.model.get('playhead');
		e.srcElement.play();
		app.Player.model.trigger('playing');
	},
	// This function causes the play/pause buttons to fail, it updates to fast.
	currentTime: function(e){
		// If it's not the first 10 seconds igonre this.
		if(e.srcElement.currentTime <= 10){
			return;
		}
		app.Player.model.set('playhead', e.srcElement.currentTime);
	},
	pause: function(e){
		app.Player.model.set('playhead', e.srcElement.currentTime);
		app.Player.model.trigger('playing');
	},
	waiting: function(e){
		this.model.trigger('loading');
	},
	loadedmetadata: function(e){
		//debugger;
		app.Player.model.set('duration', e.srcElement.duration);
	},

	/**
	 * Item has come to an end. Mark it as played etc then move on
	 */
	ended: function(e){
		// Just a wrapper.
		app.Player.playNext();
	},

	playNext: function(){
		// Make a note on the last model, so we can ping it.
		var oldModel = this.model;

		// Ok, it's over. Lets load up the next one.
		this.model = episodeItems.getNextInQueue();
		
		if(this.model != null){
			this.render();
		}
		if(oldModel != null){
			oldModel.trigger('playing');

			// Unqueue it
			oldModel.set('queued', false);
		}
	},

	/**
	 * Updates the model being used in the player.
	 */
	playPause: function(model){
		// If there is nothing already or it's a new model.
		if(this.model == null){
			this.model = model;
			this.render();
			return;
		}

		if(this.model.id != model.id){
			var oldModel = this.model;
			this.model = model;
			this.render();
			oldModel.trigger('playing');
			return;
		}

		// It's the same episode I guess:
		if(this.audioPlayer.paused){
			this.audioPlayer.play();
		} else {
			this.audioPlayer.pause();
		}

		this.model.trigger('playing');
	},

	/**
	 * Tells someone if the ID they provide is playing or not.
	 */
	isCurrentlyPlaying: function(id){
		if(this.model == null || this.audioPlayer.paused){
			return false;
		}

		if(this.model.id == id){
			return true;
		}
		return false;
	}
});