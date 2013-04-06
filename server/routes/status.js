module.exports = function(app, models) {
  app.get('/accounts/:id/status', function(req, res) {
    models.account.find(getAccountId(req), function(data) {
      res.send(account.statuses);
    });
  });

  app.post('/accounts/:id/status', function(req, res) {
    models.account.find(getAccountId(req), function(account) {
      status = {
        name: account.name,
        status: req.param('status', '')
      };
      account.statuses.push(status);

      // Push the status to all friends
      account.activities.push(status);
      account.save(function(err) {
        if (err) console.log('Error saving account: ' + err);
      });
    });
    res.send(200); // OK
  });
};

var getAccountId = function(req) {
  return (req.params.id == 'me') ? req.session.accountId : req.params.id;
};
