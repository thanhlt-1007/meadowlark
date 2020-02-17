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

// set static assets (img, css, js) folder
app.use(express.static(__dirname + '/public'));

// have to set route before 400 and 500 page
// get /
app.get('/', function(req, res) {
  res.render('home');
});

// get /about
app.get('/about', function(req, res) {
  var fortunes = [
    'Conquer your fears or they will conquer you.',
    'Rivers need springs.',
    'Do not fear what you don\'t know.',
    'You will have a pleasant surprise.',
    'Whenever possible, keep it simple.',
  ];
  var index = Math.floor(Math.random() * fortunes.length);
  var forture = fortunes[index];
  res.render('about', {forture: forture});
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
