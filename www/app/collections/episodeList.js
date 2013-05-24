var EpisodeList = Backbone.Collection.extend({
	model: Episode,
	
	getByID: function(id){
		return this.where({id:id});
    },
    getByPodcastID: function(id){
		return this.where({id:id});
    }
});