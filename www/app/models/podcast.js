var Podcast = Backbone.Model.extend({

  // Default attributes for an podcast
  defaults: function() {
    return {
      id: podcastItems.nextID(),
      title: "Some podcast title",
      description: "",
      subscribed: false, // Bool - can add episodes that you dont subscribe to, so you can get/listen to specific episodes
      lastChecked: null,
      lastUpdated: null,
      feedUrl: '',
      feedUrlEncoded: '',
      imageUrl: '',
      link: '',
      explicit: false,
      updated_at: null,
    };
  },

  initialize: function () {
    //this.episodes = episodeItems.getByPodcastID(this.get('id');
    this.set('feedUrlEncoded', encodeURIComponent(this.get('feedUrl')));

    this.listenTo(this, 'change', this.cloudSave);
  },

  cloudSave: function(){
    this.save();
  },

  getEpisodesByName: function(slug) {
    // TODO - Get single episode, from an index of the available episodes on the feed URL.
    return episodeItems.findByWhere({podcastID: this.get('id'), title: slug})[0];
  },

  getEpisodes: function() {
    return episodeItems.findByWhere({podcastID: this.get('id')});
  },

  // A Cron to run to get newer episodes. If we have time, this should be done in a Worker. If not, do it in a setTimeout().
  updateEpisodes: function(){
    var api = "https://ajax.googleapis.com/ajax/services/feed/load",
        count = '5', // Get the latest 5
        params = "?v=1.0&num=" + count + "&output=xml&q=" + this.get('feedUrlEncoded'),
        url = api + params,
        redirect = redirect;

    $.ajax({
        url: url,
        dataType: 'jsonp',
        context: this, // Fuck scope, use this ;)
        fail: function(data, textStatus, jqXHR){},
        success: function(data, textStatus, jqXHR){
            // TODO: Do some checks on the response.

            // Conver the XML reponse to a element we can jQuery over.
            var xmlDoc = $.parseXML( data.responseData.xmlString ),
            $xml = $( xmlDoc );

            
            var context = this;
            $xml.find('channel item').each(function(index, item){
              var newEpisode = {
                title: $(item).find('title').text(),
                datePublished: $(item).find('pubDate').text(),
                link: $(item).find('link').text(),
                mp3: $(item).find('enclosure').attr('url'),
                mp3_format: $(item).find('enclosure').attr('type'),
                duration: $(item).find('enclosure').attr('length'),
                description: $(item).find('description').text(),
                podcastID: context.get('id'),
                queued: (context.get('subscribed') ? true : false) // If they are subscribed, autoqueue it.
              }

              // Confirm it's legit.
              if(episodeItems.getByWhere({podcastID: newEpisode.podcastID, title: newEpisode.title}) != undefined){
                return;
              }

              // Add it!
              episodeItems.create(new Episode(newEpisode));
            });

            // Update the feed last check info.
            this.set('lastChecked', new Date());
            this.set('lastUpdated', $xml.find('channel item:first pubDate').text());
            this.save();
        }
    });
  }
});