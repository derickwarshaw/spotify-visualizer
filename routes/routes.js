var passport = require('passport')

module.exports = function(app) {
	var bodyParser = require('body-parser')
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	var SpotifyWebApi = require('spotify-web-api-node')
	
	var spotifyApi = new SpotifyWebApi({
	  clientId : process.env.CLIENT_ID,
	  clientSecret : process.env.CLIENT_SECRET,
	  redirectUri : 'http://localhost:3000/callback'
	})

	app.get('/', function(req, res) {
	  res.render('index', { user: req.user })
	})

	app.get('/account', function(req, res) {
		res.render('account', { user: req.user})
	})

	app.get('/login', function(req, res) {
	  res.render('login', { user: req.user })
	})

	app.get('/logout', function(req, res) {
	  req.logout()
	  res.redirect('/')
	})

	app.get('/app', function(req, res) {
		res.render('app', {user: req.user})
	})

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed. Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next() }
	  res.redirect('/login')
	}
}