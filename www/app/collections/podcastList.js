var PodcastList = Backbone.Collection.extend({
	model: Podcast,
    url: 'podcasts',
    path: 'podcasts',
    localStorage: new Backbone.LocalStorage("PodcastList-bb"),
    
    initialize: function () {
    },

	getByID: function(id){
		return this.where({id:id})[0];
    },
    getByFeedURL: function(feedUrl){
        return this.where({feedUrl:feedUrl})[0];
    },
    nextID: function() {
      if (!this.length) return 1;
      return this.last().get('id') + 1;
    },
    findSubscribed: function(){
        var podcasts = this.where({subscribed:true});
        return _.sortBy(podcasts, function(podcast) { return -podcast.get('lastUpdated'); });
    },

    getExpiredPodcast: function(){
        var podcasts = this.models,
        expiredDate = (new Date()).getTime() - 360, // 6 hours
        longerExpiredDate = (new Date()).getTime() - 10080 // 7 Days

        // Filter out the unexpired ones
        podcasts = _.filter(podcasts, function(podcast){
            if(podcast.get('lastChecked')){
                return 0;
            }
        });

        // now sort by most out of date
    }
    addFeed: function(feedURL, redirect){

        // If it's already been added, take the user to it.
        var podcastItem = podcastItems.getByFeedURL(feedURL) 
        if(podcastItem != undefined){
            app.navigate('podcasts/'+podcastItem.get('slug'), true);
            return;
        }

    	// TODO - Parse the feed to get it's details, then add it's episodes.
        // Poss TODO - write & host API for this on cloud (EC2?) rather than rely on google
        var api = "https://ajax.googleapis.com/ajax/services/feed/load",
            count = '1',
            params = "?v=1.0&num=" + count + "&output=xml&q=" + encodeURIComponent(feedURL),
            url = api + params,
            redirect = redirect,
            feedURL = feedURL;


        $.ajax({
            url: url,
            dataType: 'jsonp',
            context: this, // Fuck scope, use this ;)
            fail: function(data, textStatus, jqXHR){},
            success: function(data, textStatus, jqXHR){
                // TODO: Do some checks on the response.

                // Unable to find podcast
                if(data.responseData == null){
                    app.navigate('podcasts/404', true);
                    return;
                }

                // Conver the XML reponse to a element we can jQuery over.
                var xmlDoc = $.parseXML( data.responseData.xmlString ),
                $xml = $( xmlDoc );

                // TODO - check we have all of these, thus it's a podcast.
                var newPodcast = this.create(new Podcast({
                    title: $xml.find('channel > title').text(),
                    feedUrl: ($xml.find('atom\\:link[href], link[href]').attr('href') ? $xml.find('atom\\:link[href], link[href]').attr('href') : feedURL), // jQuery so smart we have to repeat this shit.
                    description: $xml.find('channel > description').text(),
                    subscribed: false,
                    link: $xml.find('channel > link').text(),
                    imageUrl: $xml.find('channel > itunes\\:image, channel > image').attr('href'),
                    lastChecked: (new Date()).getTime(),
                    lastUpdated: null,
                    explicit: ($xml.find('channel > itunes\\:explicit, channel > explicit').text() == 'no' ? false : true)
                }));

                newPodcast.updateEpisodes(function(){
                    app.navigate('podcasts/301', redirect); // Extra one needed for when adding podcast from url.
                    app.navigate('podcasts/'+newPodcast.get('slug'), redirect);
                });
            }
        });
    },

    cloudSync: function(method, options){
        // If dropbox isn't on ignore the request.
        if(!settings.get('dropboxSync')){
            return false;
        }

        if(options == null){
            options = {};
        }

        //return Backbone.ajaxSync('read', this, options);
        DropBoxSync = new DropBoxStorage(settings.dropboxClient);
        return DropBoxSync.sync(method, this, options);
    },
});