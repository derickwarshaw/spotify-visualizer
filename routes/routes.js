var passport = require('passport')

module.exports = function(app, spotifyApi) {
	var bodyParser = require('body-parser')
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({
		extended: true
	}))

	app.get('/', function(req, res) {
		res.render('index', {
			user: req.user
		})
	})

	app.get('/account', function(req, res) {
		res.render('account', {
			user: req.user
		})
	})

	app.get('/login', function(req, res) {
		res.render('login', {
			user: req.user
		})
	})

	app.get('/logout', function(req, res) {
		req.logout()
		res.redirect('/')
	})

	app.get('/app', ensureAuthenticated, function(req, res) {
		res.render('app', {
			user: req.user
		})
	})

	// app.get('/app/testSearch', ensureAuthenticated, function(req, res) {
	// 	spotifyApi.searchTracks('artist:Love')
	// 		.then(function(data) {
	// 			res.render('app', {
	// 				user: req.user,
	// 				searchData: data.body
	// 			})
	// 		}, function(err) {
	// 			console.log('Something went wrong!', err);
	// 		});
	// })

	app.get('/app/visualizer', ensureAuthenticated, function(req, res) {
		console.log(req.query)
		spotifyApi.searchTracks(req.query.song)
			.then(function(song) {
				var id = song.body.tracks.items[0].id
				console.log("song id: " + id)

			 //    spotifyApi.getAudioAnalysisForTrack(id, function(err, data) {
			 //    	console.log(data.length)
				// })
				res.render('visualizer', {
					song: song
				})
			})
	})

	app.post('/testAnalysis', ensureAuthenticated, function(req, res) {
		spotifyApi.getAudioAnalysisForTrack(req.body.id, function(err, analysis) {
			if (err)
				console.log(err)
			console.log(Object.keys(analysis.body))
			
			var spawn = require('child_process').spawn,
				py = spawn('python', ['./parser.py']),
				dataString = ''

			py.stdout.on('data', function(data) {
				console.log("new data: "+data)
				dataString += data.toString()
			})
			py.stdout.on('error',function(){
				console.log('error!')
			})
			py.stdout.on('end', function() {
				console.log("finished parsing data: "+dataString)
				res.send(dataString)
			})
			py.stdin.write(JSON.stringify(analysis.body))
			py.stdin.end()
		})
	})

	// app.post('/app/initPlayback', ensureAuthenticated, function(req,res) {
	// 	spotifyApi.getMyCurrentPlaybackState({market: 'US'},function(err, data) {
	// 		if (err) {
	// 			console.log(err)
	// 		}
			
	// 		if (data.body.is_playing) {
	// 			spotifyApi.pause(function(err, data) {
	// 				if (err)
	// 					console.log(err)
	// 				console.log(JSON.stringify(data))
	// 			})
	// 		}

	// 		res.redirect('/app/visualizer')
	// 	})
	// })

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed. Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next()
		}
		res.redirect('/')
	}
}