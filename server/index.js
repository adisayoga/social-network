var DB_PATH = 'mongodb://localhost/social-network';

var mongoose = require('mongoose');
var fs = require('fs');

// Connect to database
mongoose.connect(DB_PATH, function(error) {
  if (error) throw error;
});

var app = require('./app');

var config = {
  mail: require('./config/mail')
};

// Import the models
var models = {
  account: require('./models/account')(app, mongoose, config)
};

// Import the routes
fs.readdirSync(__dirname + '/routes').forEach(function(file) {
  if (file[0] === '.') return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./routes/' + routeName)(app, models);
});

// Import the IO
fs.readdirSync(__dirname + '/io').forEach(function(file) {
  if (file[0] === '.') return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./io/' + routeName)(app, models);
});

app.server.listen(8080, function() {
  console.log('Listening on port 8080');
});

