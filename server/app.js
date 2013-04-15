var APP_DIR       = __dirname + '/../app';
var TEMPLATES_DIR = __dirname + '/templates';

var events = require('events');
var http = require('http');
var connect = require('connect');
var cookie = require('cookie');
var sio = require('socket.io');
var express = require('express');

var app = express();

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
    key:    'express.sid',
    secret: app.sessionSecret,
    store:  app.sessionStore
  }));
});

app.get('/', function(req, res) {
  res.render(TEMPLATES_DIR + '/index.jade', { layout: false });
});

// Create an http server
app.server = http.createServer(app);

// Create an event dispatcher
app.eventEmitter = new events.EventEmitter();


// Socket IO
// ---------

app.io = sio.listen(app.server);

app.io.configure(function() {
  app.io.set('authorization', function(data, accept) {
    var signedCookies = cookie.parse(data.headers.cookie);
    var cookies = utils.parseSignedCookies(signedCookies, app.sessionSecret);
    data.sessionId = cookies['express.sid'];

    data.sessionStore = app.sessionStore;
    data.sessionStore.get(data.sessionId, function(err, session) {
      if (err || !session) return accept('Invalid session', false);

      data.session = new connect.session.Session(data, session);
      accept(null, true);
    });
  });
});

app.isAccountOnline = function(accountId) {
  var clients = app.io.sockets.clients(accountId);
  return client.length > 0;
};

app.getReqAccountId = function(req) {
  return (req.params.id === 'me') ? req.session.accountId : req.params.id;
};

module.exports = app;
