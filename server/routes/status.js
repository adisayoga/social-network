module.exports = function(app, models) {
  app.get('/accounts/:id/status', function(req, res) {
    models.account.find(getAccountId(req), function(data) {
      res.send(account.statuses);
    });
  });

  app.post('/accounts/:id/status', function(req, res) {
    var accountId = getAccountId(req);

    models.account.find(getAccountId(req), function(account) {
      var status = {
        name: account.name,
        status: req.param('status', '')
      };
      account.statuses.push(status);

      // Push the status to all friends
      account.activities.push(status);
      account.save(function(err) {
        if (err) return console.log('Error saving account: ' + err);

        app.triggerEvent('event:' + accountId, {
          from:   accountId,
          data:   status,
          action: 'status'
        });
      });
    });
    res.send(200); // OK
  });
};

var getAccountId = function(req) {
  return (req.params.id == 'me') ? req.session.accountId : req.params.id;
};
