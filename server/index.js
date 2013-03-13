var APP_DIR       = __dirname + '/../app',
    TEMPLATES_DIR = __dirname + '/templates';

var express    = require('express'),
    connect    = require('connect'),
    mongose    = require('mongoose'),
    nodemailer = require('nodemailer');

var MemoryStore = connect.session.MemoryStore;

var config = {
  mail: require('./config/mail')
};

// Import the accounts
var account = require('./models/account')(config, mongose, nodemailer);

var app = express();

app.configure(function() {
  app.set('view engine', 'jade');
  app.use(express.static(APP_DIR));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "secret key", store: new MemoryStore() }));
  mongose.connect('mongodb://localhost/social-network');
});

app.get('/', function(req, res) {
  res.render(TEMPLATES_DIR + '/index.jade', { layout: false });
});

app.post('/register', function(req, res) {
  var email     = req.param('email', null),
      password  = req.param('password', null),
      firstName = req.param('firstName', ''),
      lastName  = req.param('lastName');

  if (email == null || email.length < 8 || password == null || password.length < 6)
    return res.send(400); // Bad request

  account.register({
    email:    email,
    password: password,
    name: {
      first:  firstName,
      last:   lastName
    }
  }, function(success) {
    if (success) {
      res.send(200); // OK
    } else {
      res.send(500); // Internal Server Error
    }
  });
});

app.post('/login', function(req, res) {
  var email    = req.param('email', null),
      password = req.param('password', null);

  if (email == null || email.length < 8 || password == null || password.length < 6)
    return res.send(400); // Bad request

  account.login(email, password, function(success) {
    if (success) {
      res.send(200); // OK
    } else {
      res.send(401); // Unauthorized
    }
  });
});

app.post('/forgot-password', function(req, res) {
  var hostname = req.headers.host;
  var resetPasswordUrl = 'http://' + hostname + '/reset-password';
  var email = req.param('email', null);
  if (email == null || email.length < 8) return res.send(400); // Bad request

  account.forgotPassword(email, resetPasswordUrl, function(success) {
    if (success) {
      res.send(200); // OK
    } else {
      res.send(404); // Not found
    }
  });
});

app.get('/reset-password', function(req, res) {
  var accountId = req.param('accountId', null);
  var locals = { accountId: accountId };
  res.render(TEMPLATES_DIR + '/reset-password.jade', { locals: locals });
});

app.post('/reset-password', function(req, res) {
  var accountId = req.param('accountId', null);
  var password = req.param('password', null);
  if (accountId != null || password != null) {
    account.changePassword(accountId, password);
  }
  res.render(TEMPLATES_DIR + '/reset-password-success.jade');
});

app.get('/account/authenticate', function(req, res) {
  if (req.session.loggedIn) {
    res.send(200); // OK
  } else {
    res.send(401); // Unauthorized
  }
});

app.listen(8080);
