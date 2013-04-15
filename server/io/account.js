module.exports = function(app, models) {
  app.io.on('connection', function(socket) {
    var currentAccount = null;
    var session = socket.handshake.session;
    var accountId = session.accountId;

    // Emit login event
    data = { from: accountId, action: 'login' };
    app.eventEmitter.emit('event:' + accountId, data);

    // Subscribe to each contacts
    models.account.find(accountId, function(account) {
      currentAccount = account;
      var subscribedAccounts = [];
      account.contacts.forEach(function(contact) {
        if (subscribedAccounts.indexOf(contact.accountId) === -1) {
          subscribedAccounts.push(contact.accountId);
          subscribeToAccount(contact.accountId);
        }
      });
      if (subscribedAccounts.indexOf(accountId) === -1) {
        // Subscribe to my own updates
        subscribeToAccount(accountId);
      }
    });

    socket.on('disconnect', function() {
      // Emit logout event
      data = { from: accountId, action: 'logout' };
      app.eventEmitter.emit('event:' + accountId, data);

      // Unsubscribe from my contacts
      currentAccount.contacts.forEach(function(contact) {
        var eventName = 'event:' + contact.accountId;
        app.eventEmitter.removeListener(eventName, handleContactEvent);
        console.log('Unsubscribing from ' + eventName);
      });
    });

    var subscribeToAccount = function(accountId) {
      var eventName = 'event:' + accountId;
      app.eventEmitter.on(eventName, handleContactEvent);
      console.log('Subscribing to ' + eventName);
    };

    var handleContactEvent = function(data) {
      socket.emit('contact_event', data);
    };
  });
};
