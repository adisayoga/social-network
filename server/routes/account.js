module.exports = function(app, models) {
  app.get('/accounts/:id', function(req, res) {
    var accountId = app.getReqAccountId(req);
    models.account.find(accountId, function(account) {
      if (req.params.id === 'me' || models.account.hasContact(account, accountId)) {
        account.isFriend = true;
      }
      res.send(account);
    });
  });

  app.get('/accounts/:id/activity', function(req, res) {
    models.account.find(app.getReqAccountId(req), function(account) {
      res.send(account.activities);
    });
  });
};
