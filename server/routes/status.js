module.exports = function(app, models) {
  app.get('/accounts/:id/status', function(req, res) {
    models.account.find(app.getReqAccountId(req), function(data) {
      res.send(account.statuses);
    });
  });

  app.post('/accounts/:id/status', function(req, res) {
    var accountId = app.getReqAccountId(req);

    models.account.find(app.getReqAccountId(req), function(account) {
      var status = {
        name:   account.name,
        status: req.param('status', '')
      };
      account.statuses.push(status);

      // Push the status to all friends
      account.activities.push(status);
      account.save(function(error) {
        if (error) return console.error('Error saving account:', error);

        app.eventEmitter.emit('event:' + accountId, {
          from:   accountId,
          data:   status,
          action: 'status'
        });
      });
    });
    res.send(200); // OK
  });
};
