module.exports = function(app, models) {
  app.get('/account/authenticated', function(req, res) {
    res.send(req.session.loggedIn ? 200 : 401); // OK/Unauthorized
  });

  app.post('/register', function(req, res) {
    var email     = req.param('email', null);
    var password  = req.param('password', null);
    var firstName = req.param('firstName', '');
    var lastName  = req.param('lastName');

    if (email === null || email.length < 8 || password === null || password.length < 6)
      return res.send(400); // Bad request

    models.account.register({
      email:    email,
      password: password,
      name: {
        first:  firstName,
        last:   lastName
      }
    }, function(success) {
      res.send(success ? 200: 500); // OK/Internal server error
    });
  });

  app.post('/login', function(req, res) {
    var email    = req.param('email', null);
    var password = req.param('password', null);

    if (email === null || email.length < 8 || password === null || password.length < 6) {
      var message = 'Email dan atau password tidak boleh kosong atau terlalu pendek!';
      return res.send(400, message); // Bad request
    }

    models.account.login(email, password, function(success, account) {
      if (!success) {
        var message = 'Email dan atau password salah!';
        return res.send(401, message); // Unauthorized
      }

      req.session.accountId = account._id;
      req.session.loggedIn = true;

      app.eventEmitter.emit('logged_in', account);
      res.send(account);
    });
  });

  app.post('/forgot-password', function(req, res) {
    var hostname = req.headers.host;
    var resetPasswordUrl = 'http://' + hostname + '/reset-password';
    var email = req.param('email', null);

    if (email === null || email.length < 8) return res.send(400); // Bad request

    models.account.forgotPassword(email, resetPasswordUrl, function(success) {
      res.send(success ? 200: 404); // OK/Not found
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
    if (accountId === null || password === null)
      return res.send(400); // Bad request

    models.account.changePassword(accountId, password, function(success) {
      res.render(TEMPLATES_DIR + '/reset-password-success.jade');
    });
  });
};
