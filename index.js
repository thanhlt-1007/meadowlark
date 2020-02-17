var express = require('express');

var app = express();

// set port
app.set('port', process.env.PORT || 3000);
// listen port
app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl + C to terminate.');
});

// custom 400 page
app.use(function(req, res) {
  res.type('text/plain');
  res.status(404);
  res.send('400 - Not Found');
});

// custom 500 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Server Error');
});
