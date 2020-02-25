var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');

// require lib
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');

// create app
var app = express();

// set port
app.set('port', process.env.PORT || 3000);
// listen port
app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl + C to terminate.');
});

// set view engine handlebar
// set default layout views/layouts/main.handlebars
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function(name, options) {
      if (!this._section) this._sections = {}

      this._sections[name] = options.fn(this);
      return null;
    }
  }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// use middleware to parse URL-encoded body
app.use(bodyParser());

// use middleware to set static assets (img, css, js) folder
app.use(express.static(__dirname + '/public'));

// use middleware to inject data to res.locals.partials object
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = weather.getWeatherData();
 	next();
});

// have to set route before 400 and 500 page
// get /
app.get('/', function(req, res) {
  res.render('home');
});

// get /about
app.get('/about', function(req, res) {
  res.render('about', {fortune: fortune.getFortune()});
});

// get /handlebars
app.get('/handlebars', function(req, res) {
  res.render('handlebars', {
    firstName: 'Le',
    lastName: 'Tan Thanh',

    person: {
      firstName: 'Le',
      lastName: 'Tan Thanh'
    },

    hello: 'Hello',
    people: [{
      firstName: 'Le',
      lastName: 'Tan Thanh 01'
    },{
      firstName: 'Le',
      lastName: 'Tan Thanh 02'
    }],

    specialChars: '& < > \" \' ` =',

    links: [{
      url: 'foo', test: true, title: 'bar'
    },{
      url: 'foo'
    }],

    author: {
      firstName: 'Le',
      lastName: 'Tan Thanh'
    }
  });
});

// get /handlebars/basic
app.get('/handlebars/basic', function(req, res) {
  res.render('handlebars/basic', {
    name: 'Buttercup',
    nameHTML: '<b>Buttercup</b>'
  });
});

// get /handlebars/comments
app.get('/handlebars/comments', function(req, res) {
  res.render('handlebars/comments');
});

// get /handlebars/blocks
app.get('/handlebars/blocks', function(req, res) {
  res.render('handlebars/blocks', {
    currency: {
      name: 'United States dollars',
      abbrev: 'USD'
    },
    tours: [
      {name: 'Hood River', price: '$99.95'},
      {name: 'Oregon Coast', price: '$159.95'}
    ],
    specialsUrl: '/january-specials',
    currencies: ['USD', 'GBP', 'BTC']
  });
});

// get /headers
app.get('/headers', function(req, res) {
  var headersString = '';
  var headers = req.headers;

  for(var name in req.headers) {
    headersString += name + ': ' + headers[name] + '\n';
  }
  res.render('headers', {headersString: headersString});
});

// get /request
app.get('/request', function(req, res) {
  // req.params
  // An array containing the named route parameters
  // Chapter 14
  params = req.params
  console.log('\nparams');
  console.log(params);

  // req.param(name)
  // The named route parameters
  // GET or POST parameters
  // avoiding this method

  // req.query
  // object contain query string parameters (GET parameters) as name/value pair
  query = req.query
  console.log('\nquery');
  console.log(query);

  // req.body
  // object contain POST parameters
  // need middleware that can parse the body content type
  // Chapter 10
  body = req.body
  console.log('\nbody');
  console.log(body);

  // req.route
  // Information about the currently metched route
  // Useful for route debugging
  route = req.route
  console.log('\nroute');
  console.log(route);

  // req.cookies
  // object contain cookie values passed from the client
  cookies = req.cookies;
  console.log('\ncookies');
  console.log(cookies);

  // req.headers
  // request header received from the client
  headers = req.headers;
  console.log('\nheaders');
  console.log(headers);

  // req.accepts([types])
  // determine whether the cient accepts a given type or types
  // optional types can be a single MIME type, such as application/json, a comma delimited list, or an array
  // This method is of primary interest to those writting public APIs
  // It is assumed that browser will always accept HTML by default

  // req.ip
  // The IP address of the client
  ip = req.ip;
  console.log('\nip');
  console.log(ip);

  // req.path
  // The request path (without protocol, host, port or query string)
  path = req.path;
  console.log('\npath');
  console.log(path);

  // req.host
  // returns the host name reported by the client
  // this information can be spoofed and should not be used for security purposes.
  host = req.host;
  console.log('\nhost');
  console.log(host);

  // req.xhr
  // returns true if the request originated from an AJAX call
  xhr = req.xhr;
  console.log('\nxhr');
  console.log(xhr);

  // req.protocol
  // the protocol used in making this request, for our purposes, it will either be http pr https
  protocol = req.protocol
  console.log('\nprotocol');
  console.log(protocol);

  // req.url
  // return the path and querystring (they do not include protocol, host, or port)
  // req.url can be written for internal rouring purpose
  // but req.originalUrl is designed to remain the original request and query string
  url = req.url;
  console.log('\nurl');
  console.log(url);

  res.render('request');
});

// get /newsletter
app.get('/newsletter', function(res, res) {
  res.render('newsletter', {
    csrf: 'CSRF token goes here'
  });
});

// post /process
app.post('/process', function(req, res) {
  if(req.xhr || req.accepts('application/json') === 'application/json') {
    // xhr is short for XML HTTP Request
    // submit form via ajax request
    res.send({success: true});
  } else {
    // submit form via HTML request
    console.log('headers: ' + req.headers);
    console.log('\nPROCESSING ... POST ... /process\n');
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/thank-you');
  }
});

// get /thank-you
app.get('/thank-you', function(res, res) {
  res.render('thank-you');
});

// get /contest/vacation-photo
app.get('/contest/vacation-photo', function(req, res) {
  var now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth()
  })
});

// post /contest/vacation-photo/:year/:month
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return res.redirect(303, '/error');

    console.log('received fields: ');
    console.log(fields);

    // size
    // the path it was uploaded to
    // (usually a random name in a temporary directory)
    // original name of the file that the user uploaded
    // (just the filename, not the whole pathm for security and privacy reasons)
    console.log('files: ');
    console.log(files);

    res.redirect(303, '/thank-you');
  });
});

// custom 400 page
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});
