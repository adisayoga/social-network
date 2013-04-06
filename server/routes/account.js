module.exports = function(app, models) {
  app.get('/accounts/:id', function(req, res) {
    var accountId = getAccountId(req);
    models.account.find(accountId, function(account) {
      if (req.params.id == 'me' || models.account.hasContact(account, accountId)) {
        account.isFriend = true;
      }
      res.send(account);
    });
  });

  app.get('/accounts/:id/activity', function(req, res) {
    models.account.find(getAccountId(req), function(account) {
      res.send(account.activities);
    });
  });
};

var getAccountId = function(req) {
  return (req.params.id == 'me') ? req.session.accountId : req.params.id;
};
