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

	app.post('/app', ensureAuthenticated, function(req, res) {
		spotifyApi.searchTracks(req.body.song)
			.then(function(data) {
				res.send(data)
			}, function(err) {
				console.log('Something went wrong!', err);
			});
	})

	app.get('/app/visualizer', /*ensureAuthenticated, */function(req, res) {
		res.render('visualizer')
	})

	app.post('/app/initPlayback', ensureAuthenticated, function(req,res) {
		spotifyApi.getMyCurrentPlaybackState({market: 'US'},function(err, data) {
			if (err) {
				res.send(err) 
			}
			console.log('data: '+JSON.stringify(data))
			res.send(data)
		})
	})

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