module.exports = function(app) {
	var bodyParser = require('body-parser')
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	var passport = require('passport'),
		SpotifyStrategy = require('passport-spotify').Strategy

	// Passport session setup.
	//   To support persistent login sessions, Passport needs to be able to
	//   serialize users into and deserialize users out of the session. Typically,
	//   this will be as simple as storing the user ID when serializing, and finding
	//   the user by ID when deserializing. However, since this example does not
	//   have a database of user records, the complete spotify profile is serialized
	//   and deserialized.
	passport.serializeUser(function(user, done) {
	  done(null, user)
	})

	passport.deserializeUser(function(obj, done) {
	  done(null, obj)
	})


	// Use the SpotifyStrategy within Passport.
	//   Strategies in Passport require a `verify` function, which accept
	//   credentials (in this case, an accessToken, refreshToken, and spotify
	//   profile), and invoke a callback with a user object.
	passport.use(new SpotifyStrategy({
	  clientID: process.env.CLIENT_ID,
	  clientSecret: process.env.CLIENT_SECRET,
	  callbackURL: 'http://localhost:3000/callback'
	  },
	  function(accessToken, refreshToken, profile, done) {
	    // asynchronous verification, for effect...
	    process.nextTick(function () {
	      // To keep the example simple, the user's spotify profile is returned to
	      // represent the logged-in user. In a typical application, you would want
	      // to associate the spotify account with a user record in your database,
	      // and return that user instead.
	      return done(null, profile)
    	})
  	}))

	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(passport.initialize())
	app.use(passport.session())

	var SpotifyWebApi = require('spotify-web-api-node')
	
	var spotifyApi = new SpotifyWebApi({
	  clientId : process.env.CLIENT_ID,
	  clientSecret : process.env.CLIENT_SECRET,
	  redirectUri : 'http://localhost:3000/callback'
	})

	app.get('/', function(req, res) {
	  res.render('index', { user: req.user })
	})

	app.get('/account', ensureAuthenticated, function(req, res){
	  res.render('account', { user: req.user })
	})

	app.get('/login', function(req, res){
	  res.render('login', { user: req.user })
	})

	// GET /auth/spotify
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request. The first step in spotify authentication will involve redirecting
	//   the user to spotify.com. After authorization, spotify will redirect the user
	//   back to this application at /auth/spotify/callback
	app.get('/auth/spotify',
	  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}),
	  function(req, res){
	// The request will be redirected to spotify for authentication, so this
	// function will not be called.
	})

	// GET /callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request. If authentication fails, the user will be redirected back to the
	//   login page. Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/callback',
	  passport.authenticate('spotify', { failureRedirect: '/login' }),
	  function(req, res) {
	  	console.log(res)
	    res.redirect('/')
  	})

	app.get('/logout', function(req, res){
	  req.logout()
	  res.redirect('/')
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