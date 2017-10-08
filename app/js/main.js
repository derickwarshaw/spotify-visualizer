'use strict'

$(document).ready( function() {
	$('#search').click((e) => {
		e.preventDefault()
		var searchSong = $('#app input').val();
		$.post('/app', {song: searchSong}, function(data) {
			$('#songs').text(data.body.tracks.items[0].name+" by: "+data.body.tracks.items[0].artists[0].name)
			console.log(JSON.stringify(data.body.tracks.items[0].artists[0].name))
			window.open(data.body.tracks.items[0].external_urls.spotify)

			initPlayback()
		})
	})
})

function initPlayback() {
	$.post('/app/initPlayback', function(data) {
		$('#test').text(data.body.is_playing)
		console.log(data)
	})
}