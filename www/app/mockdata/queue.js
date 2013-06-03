// This is just mock data, this will be pulled from the users DB at some point.

// If local stoage stuff has already been added use that instead, otherwise create new data.
if(podcastItems.localStorage.findAll()[0] != undefined){
	podcastItems.add(podcastItems.localStorage.findAll());
	episodeItems.add(episodeItems.localStorage.findAll());
} else {

	// Add in a few podcasts
	podcastItems.create(
		new Podcast({
			title:'Friday Night Comedy from BBC Radio 4', 
			feedUrl: 'http://downloads.bbc.co.uk/podcasts/radio4/fricomedy/rss.xml',
			imageUrl: 'http://www.bbc.co.uk/podcasts/assets/artwork/fricomedy.jpg',
			subscribed: true
		})
	);
	podcastItems.create(
		new Podcast({
			title:'Stuff You Missed in History Class Podcast', 
			feedUrl: 'http://www.howstuffworks.com/podcasts/stuff-you-missed-in-history-class.rss',
			imageUrl: 'http://podcasts.howstuffworks.com/hsw/podcasts/symhc/symhc-logo.jpg',
			subscribed: true
		})
	);
	// Add a few epsidoes to these podcasts
	podcastItems.each(function(podcast){
		for(var id = 1; id <= 3; id++){
			episodeItems.create(
				new Episode({
					title: 'Episode '+id+' of this', podcastID: podcast.get('id'),
					queued: true // If it's true, it gets put on the end. Neat aye?
				})
			);
		}
	});
}