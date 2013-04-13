var APP_DIR       = __dirname + '/../app';
var TEMPLATES_DIR = __dirname + '/templates';

var express    = require('express');
var http       = require('http');
var connect    = require('connect');
var mongoose   = require('mongoose');
var nodemailer = require('nodemailer');
var fs         = require('fs');
var events     = require('events');

var config = {
  mail: require('./config/mail')
};

// Import the models
var models = {
  account: require('./models/account')(config, mongoose, nodemailer)
};

// Create an http server
var app = express();
app.server = http.createServer(app);

// Create an event dispatcher
var eventDispatcher = new events.EventEmitter();
app.addEventListener = function(eventName, callback) {
  eventDispatcher.on(eventName, callback);
};
app.removeEventListener = function(eventName, callback) {
  eventDispatcher.removeListener(eventName, callback);
};
app.triggerEvent = function(eventName, eventOptions) {
  eventDispatcher.emit(eventName, eventOptions);
};

app.configure(function() {
  // Create a session store to share between methods
  app.sessionStore = new connect.session.MemoryStore();
  app.sessionSecret = 'SocialNet secret key';

  app.set('view engine', 'jade');

  app.use(express.static(APP_DIR));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  app.use(express.session({
    secret: app.sessionSecret,
    key:    'express.sid',
    store:  app.sessionStore
  }));

  mongoose.connect('mongodb://localhost/social-network', function(err) {
    if (err) throw err;
  });
});

// Index route
app.get('/', function(req, res) {
  res.render(TEMPLATES_DIR + '/index.jade', { layout: false });
});

// Routes
fs.readdirSync(__dirname + '/routes').forEach(function(file) {
  if (file[0] == '.') return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./routes/' + routeName)(app, models);
});

app.server.listen(8080, function() {
  console.log('Listening on port 8080');
});
