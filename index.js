var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session')

var env = process.env.NODE_ENV || 'development'

if ('development' == env) {
    require('dotenv').config()
    console.log()
}

var app = express()

// Routes
var routes = require('./routes/routes')
routes(app)

// configure Express
app.set('views', __dirname + '/app/templates')
app.set('view engine', 'pug')
app.set('port', process.env.PORT || 3000)

app.use(cookieParser())
app.use(bodyParser())
app.use(methodOverride())
app.use(session({ secret: 'i love calhacks' }))

// Static files
app.use('/dist', express.static(__dirname + '/dist'))

app.listen(app.get('port'), function() {
	console.log("App is listening on port "+app.get('port'))
})
