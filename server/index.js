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
  account: require('./models/account')(config, mongose, nodemailer)
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

var getAccountId = function(req) {
  return req.params.id == 'me' ? req.session.accountId : req.params.id;
};


// Response code:
//  - 200 (OK)
//  - 400 (Bad Request)
//  - 401 (Unauthorized)
//  - 404 (Not Found)
//  - 500 (Internal Server Error)

app.listen(8080, function() {
  console.log('Server listening on port 8080');
});


/*-- Index --*/

app.get('/', function(req, res) {
  res.render(TEMPLATES_DIR + '/index.jade', { layout: false });
});


/*-- Account --*/

app.get('/accounts/:id', function(req, res) {
  models.account.find(getAccountId(req), function(account) {
    if (accountId == 'me'
        || models.account.hasContact(account, req.session.accountId)) {
      account.isFriend = true;
    }
    res.send(account);
  });
});


/*-- Status account --*/

app.get('/accounts/:id/status', function(req, res) {
  models.account.find(getAccountId(req), function(data) {
    res.send(account.status);
  });
});

app.post('/accounts/:id/status', function(req, res) {
  models.account.find(getAccountId(req), function(account) {
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


/*-- Activity account --*/

app.get('/accounts/:id/activity', function(req, res) {
  models.account.find(getAccountId(req), function(account) {
    res.send(account.activity);
  });
});


/*-- Contacts account --*/

app.get('/accounts/:id/contact', function(req, res) {
  models.account.find(getAccountId(req), function(account) {
    res.send(account.contacts);
  });
});

app.post('/account/:id/contact', function(req, res) {
  var accountId = getAccountId(req)
  var contactId = req.param('contactId', null);

  // Missing contactId, don't bother going any further
  if (contactId == null) return res.send(400);

  models.account.find(accountId, function(account) {
    if (!account) return;
    models.account.find(contactId, function(contact) {
      if (!contact) return;
      models.account.addContact(account, contact);
      models.account.addContact(contact, account); // Make the reverse link
      account.save();
    });
  });

  // Note: Not in callback - this endpoint returns immediately and processes
  // in background
  res.send(200);
});

app.delete('/accounts/:id/contact', function(req, res) {
  var accountId = getAccountId(req);
  var contactId = req.param('contactId', null);

  // Missing contactId, don't bother going any further
  if (contactId == null) return res.send(400);

  models.account.find(accountId, function(account) {
    if (!account) return;
    models.account.find(contactId, function(contact) {
      if (!contact) return;
      models.account.removeContact(account, contactId);
      models.account.removeContact(contact, accountId); // Kill the reverse link
      account.save();
    });
  });

  // Note: Not in callback - this endpoint returns immediately and processes
  // in background
  res.send(200);
});

app.post('/contacts/find', function(req, res) {
  var searchText = req.param('searchText', null);
  if (searchText == null) return res.send(400);

  models.account.search(searchText, function(err, accounts) {
    if (err || accounts.length == 0) return res.send(404);
    res.send(accounts);
  });
});


/*-- Authentication --*/

app.get('/account/authenticate', function(req, res) {
  res.send(req.session.loggedIn ? 200 : 401)
});

app.post('/register', function(req, res) {
  var email     = req.param('email', null);
  var password  = req.param('password', null);
  var firstName = req.param('firstName', '');
  var lastName  = req.param('lastName');

  if (email == null || email.length < 8 || password == null || password.length < 6)
    return res.send(400);

  models.account.register({
    email:    email,
    password: password,
    name: {
      first:  firstName,
      last:   lastName
    }
  }, function(success) {
    res.send(success ? 200: 500);
  });
});

app.post('/login', function(req, res) {
  var email    = req.param('email', null);
  var password = req.param('password', null);

  if (email == null || email.length < 8 || password == null || password.length < 6)
    return res.send(400, 'Email dan atau password tidak boleh kosong atau terlalu pendek!');

  models.account.login(email, password, function(success, account) {
    if (!success) return res.send(401, 'Email dan atau password salah!');

    req.session.accountId = account._id;
    req.session.loggedIn = true;
    res.send(200);
  });
});

app.post('/forgot-password', function(req, res) {
  var hostname = req.headers.host;
  var resetPasswordUrl = 'http://' + hostname + '/reset-password';
  var email = req.param('email', null);

  if (email == null || email.length < 8) return res.send(400);

  models.account.forgotPassword(email, resetPasswordUrl, function(success) {
    res.send(success ? 200: 404);
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
  if (accountId == null || password == null) {
    return res.send(400);
  }
  models.account.changePassword(accountId, password, function(success) {
    res.render(TEMPLATES_DIR + '/reset-password-success.jade');
  });
});

