var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	passport = require('passport'),
	SpotifyStrategy = require('passport-spotify').Strategy

var env = process.env.NODE_ENV || 'development'

if ('development' == env) {
	require('dotenv').config()
}

var app = express()

// configure Express
app.set('views', __dirname + '/app/templates')
app.set('view engine', 'pug')
app.set('port', process.env.PORT || 3000)

// Static files
app.use('/dist', express.static(__dirname + '/dist'))

app.use(cookieParser())
app.use(bodyParser())
app.use(methodOverride())
app.use(session({
	secret: 'i love calhacks',
	resave: true,
	saveUninitialized: true
}))

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize())
app.use(passport.session())

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
		process.nextTick(function() {
			console.log('accessToken: ' + accessToken+'\n')
			spotifyApi.setAccessToken(accessToken)
			console.log()
			console.log('refreshToken: ' + refreshToken+'\n')
			spotifyApi.setRefreshToken(refreshToken)
			console.log()
			return done(null, profile)
		})
	}))

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
	passport.authenticate('spotify', {
		scope: ['user-read-private', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing']
	}),
	function(req, res) {
		// The request will be redirected to spotify for authentication, so this
		// function will not be called.
	})

var SpotifyWebApi = require('spotify-web-api-node')
var spotifyApi = new SpotifyWebApi({
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		redirectUri: 'http://localhost:3000/callback'
	})
	// GET /callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request. If authentication fails, the user will be redirected back to the
	//   login page. Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
app.get('/callback',
	passport.authenticate('spotify', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		var code = req.query.code
		console.log('query code: '+code)
		// spotifyApi.authorizationCodeGrant(code)
		// 	.then(function(data) {
		// 		console.log('The token expires in ' + data.body['expires_in']);
		// 		console.log('The access token is ' + data.body['access_token']);
		// 		console.log('The refresh token is ' + data.body['refresh_token']);

		// 		// Set the access token on the API object to use it in later calls
		// 		spotifyApi.setAccessToken(data.body['access_token']);
		// 		spotifyApi.setRefreshToken(data.body['refresh_token']);
		// 	}, function(err) {
		// 		console.log('Something went wrong in callback', err);
		// 	});
		res.redirect('/app')
	})


// Routes
var routes = require('./routes/routes')
routes(app, spotifyApi)

app.listen(app.get('port'), function() {
	console.log("App is listening on port " + app.get('port'))
})