var passport = require('passport')

var SpotifyWebApi = require('spotify-web-api-node')

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback'
})

// Get an access token and 'save' it using a setter
spotifyApi.clientCredentialsGrant()
    .then(function(data) {
        console.log('The access token is ' + data.body['access_token']);
        spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
        console.log('Something went wrong!', err);
    });

module.exports = function(app) {
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

    app.get('/app/testSearch', ensureAuthenticated, function(req, res) {
        spotifyApi.searchTracks('artist:Love')
            .then(function(data) {
                res.render('app', {
                    user: req.user,
                    searchData: data.body
                })
            }, function(err) {
                console.log('Something went wrong!', err);
            });
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