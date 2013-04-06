module.exports = function(app, models) {
  app.get('/accounts/:id/contacts', function(req, res) {
    models.account.find(getAccountId(req), function(account) {
      res.send(account.contacts);
    });
  });

  app.post('/accounts/:id/contact', function(req, res) {
    var accountId = getAccountId(req)
    var contactId = req.param('contactId', null);

    // Missing contactId, don't bother going any further
    if (contactId == null) return res.send(400); // Bad request

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
    res.send(200); // OK
  });

  app.delete('/accounts/:id/contact', function(req, res) {
    var accountId = getAccountId(req);
    var contactId = req.param('contactId', null);

    // Missing contactId, don't bother going any further
    if (contactId == null) return res.send(400); // Bad request

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
    res.send(200); // OK
  });

  app.post('/contacts/find', function(req, res) {
    var searchText = req.param('searchText', null);
    if (searchText == null) return res.send(400); // Bad request

    models.account.search(searchText, function(err, accounts) {
      if (err || accounts.length == 0) return res.send(404); // Not found
      res.send(accounts);
    });
  });
};

var getAccountId = function(req) {
  return (req.params.id == 'me') ? req.session.accountId : req.params.id;
};
