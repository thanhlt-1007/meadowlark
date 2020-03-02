var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

// require lib
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');
var credentials = require('./lib/credentials.js');

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

// use middleware cookie-parser
app.use(cookieParser(credentials.cookieSecret));

// use middleware express-session

// accepts a configuration object with the following options

// key
// the name of the cookie that will store the unique session identifier
// defaults to connect.sid

// store
// an instance of a session store
// defaultes to an instance of MemoryStore
// which is fine for our current purpose

// cookie
// cookie settings for the session cookie
// regular cookie default apply

app.use(expressSession());

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

// use middleware to set flash to res.locals.flash and delete flash in req.session.flash
app.use(function(req, res, next) {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// middleware

// route handlers (app.get, app.post, etc often referred to collectively as app.VERB)
// can be thought of as middleware that handle only a specific HTTP verb (GET, POST, etc)
// conversely, middleware can be thought of as a route handler that handles all HTTP verbs

// route handlers require a path as their first parameter
// if you want that path to match any route, simply use /*
// middle ware can also take a path as its first parameter
// but it is optional (if it is omitted, it will match any path, as if you haf specific /*)

// route handlers and middleware take a callback function that take two, there, or four parameters
// technically, you could also have zero or one parameters, but there is nor sensible use for these forms
// ir there are two or three parameters, the first two parameters are the request and response objects
// and the thord parameters is the next function
// if there are four parameters, it becomes and error-handling middleware
// and the first parameter becomes and error object,
// follow be the request response and next object

// if you do not call next(), it's generally inadvisable to send a response to the client
// if you do, middleware or route handlers futher down the pipeline will be executed
// but any client responses they send will be ignored

// middleware is excuted as ordered below
// app.use(function(req, res, next) {
//   console.log('\n...CALLING 000 middleware\n');
//   console.log('Processing request for ' + req.url + '...');
//   next();
// });

// app.use(function(req, res, next) {
//   console.log('\n...CALLING 001 middleware\n');
//   console.log('Terminating request');
//   res.send('thanks for playing !');
//   // note that we do not call next() here ... this terminates the request
// });

// app.use(function(req, res, next) {
//   console.log('\n...CALLING 002 middleware\n');
//   console.log('whoops, i\'ll never get called!');
// });

app.use(function(req, res, next){
  console.log('\n\nALLWAYS');
  next();
});

app.get('/a', function(req, res){
  console.log('/a: route terminated');
  res.send('a');
});

app.get('/a', function(req, res){
  console.log('/a: never called');
});

app.get('/b', function(req, res, next){
  console.log('/b: route not terminated');
  next();
});

app.use(function(req, res, next){
  console.log('SOMETIMES');
  next();
});

app.get('/b', function(req, res, next){
  console.log('/b (part 2): error thrown' );
  throw new Error('b failed');
});

app.use('/b', function(err, req, res, next){
  console.log('/b error detected and passed on');
  next(err);
});

app.get('/c', function(err, req){
  console.log('/c: error thrown');
  throw new Error('c failed');
});

app.use('/c', function(err, req, res, next){
  console.log('/c: error deteccted but not passed on');
  next();
});

app.use(function(err, req, res, next){
  console.log('unhandled error detected: ' + err.message);
  res.send('500 - server error');
});

// have to set route before 400 and 500 page
// get /
app.get('/', function(req, res) {
  res.cookie('monster', 'Monster');
  console.log('Cookie Monster: ' + req.cookies.monster);

  // optional options

  // domain:
  // controls the domains the cookie is associated with
  // this allow you to assign cookies to specific subdomains
  // Note that you cannot set cookie for a different domain thanh the server is running on: it will simply do nothing

  // path:
  // controls the path this cookir is applies to.
  // note that paths have an implicit wildcard after them
  // if you use a path of / (default), it will apply to all pages on your site
  // if you use a path of /foo, it will apply to the path /foo, /foo/bar, etc, ...

  // maxAge
  // specifies how long the client should keep the cookie before deleting it in miliseconds
  // if you omit it, the cookie will be deleted when you close your browser
  // You can also specify a date for expiration with the expires option
  // but the syntax is frustrating, I recommend using maxAge

  // secure
  // specifies that this cookie will be sent only over a secure (HTTPS) connection
 
  // httpOnly
  // setting this to true specifies the cookie will be modified only be the server
  // that is, client-side Javascript can not modify it
  // this helps prevent XSS attack

  // signed
  // set to true to sign this cookie, making it available in res.signedCookies instead of res.cookies
  // signed cookies that have been tampered with will be rejected by the server
  // and the cookie valye will be reset to its original value

  res.cookie('signedMonster', 'Signed Monster', {signed: true});
  console.log('Signed Cookie Monster: ' + req.signedCookies.signedMonster);

  res.clearCookie('monster');

  req.session.userName = 'Anonymous';
  var colorScheme = req.session.colorScheme || 'dark';

  req.session.userName = null;
  delete req.session.colorScheme;

  req.session.flash = {
    type: 'success',
    intro: 'TEST',
    message: 'This is a test flash'
  }
  res.redirect(303, '/thank-you');
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
