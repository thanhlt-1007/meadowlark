var express = require('express');

var app = express();

// set port
app.set('port', process.env.PORT || 3000);
// listen port
app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl + C to terminate.');
});

// set view engine handlebar
// set default layout views/layouts/main.handlebars
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// have to set route before 400 and 500 page
// get /
app.get('/', function(req, res) {
  res.render('home');
});

// get /about
app.get('/about', function(req, res) {
  res.render('about')
});

// custom 400 page
app.use(function(req, res) {
  res.status(404);
  res.render('400');
});

// custom 500 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});
