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

// Import the models
var models = {
  account: require('./models/account')(config, mongose, nodemailer);
}

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

app.get('/accounts/:id', function(req, res) {
  var accountId = req.params.id == 'me' ? req.req.session.accountId : req.params.id;
  models.account.findOne({ _id: accountId }, function(data) {
    res.send(data);
  });
});

app.get('/accounts/:id/status', function(req, res) {
  var accountId = req.params.id == 'me' ? req.req.session.accountId : req.params.id;
  models.account.findOne({ _id: accountId }, function(data) {
    res.send(account.status);
  });
});

app.post('/accounts/:id/status', function(req, res) {
  var accountId = req.params.id == 'me' ? req.req.session.accountId : req.params.id;
  models.account.findOne({ _id: accountId }, function(account) {
    status = {
      name: account.name,
      status: req.param('status', '')
    };
    account.status.push(status);

    // Push the status to all friends
    account.activity.push(status);
    account.save(function(err) {
      if (err) console.log('Error saving account: ' + err);
    });
  });
  res.send(200);
});

app.get('/account/:id/activity', function(req, res) {
  var accountId = req.params.id == 'me' ? req.req.session.accountId : req.params.id;
  models.account.findOne({ _id: accountId }, function(account) {
    res.send(account.activity);
  });
});

app.get('/account/authenticate', function(req, res) {
  res.send(req.session.loggedIn ? 200 : 401) // OK/Unauthorized
});

app.post('/register', function(req, res) {
  var email     = req.param('email', null),
      password  = req.param('password', null),
      firstName = req.param('firstName', ''),
      lastName  = req.param('lastName');

  if (email == null || email.length < 8 || password == null || password.length < 6)
    return res.send(400); // Bad request

  models.account.register({
    email:    email,
    password: password,
    name: {
      first:  firstName,
      last:   lastName
    }
  }, function(success) {
    res.send(success ? 200, 500); // OK/Internal Server Error
  });
});

app.post('/login', function(req, res) {
  var email    = req.param('email', null),
      password = req.param('password', null);

  if (email == null || email.length < 8 || password == null || password.length < 6)
    return res.send(400); // Bad request

  models.account.login(email, password, function(success) {
    res.send(success ? 200, 401); // OK/Unauthorized
  });
});

app.post('/forgot-password', function(req, res) {
  var hostname = req.headers.host;
  var resetPasswordUrl = 'http://' + hostname + '/reset-password';
  var email = req.param('email', null);
  if (email == null || email.length < 8) return res.send(400); // Bad request

  models.account.forgotPassword(email, resetPasswordUrl, function(success) {
    res.send(success ? 200, 500); // OK/Not found
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
    models.account.changePassword(accountId, password, function(success) {
      res.render(TEMPLATES_DIR + '/reset-password-success.jade');
    });
  }
});

app.listen(8080);
