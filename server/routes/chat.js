module.exports = function(app, models) {
  var io      = require('socket.io'),
      connect = require('connect'),
      cookie  = require('cookie'),
      Session = connect.middleware.session.Session,
      utils   = connect.utils;

  var sio = io.listen(app.server);
  sio.configure(function() {
    app.isAccountOnline = function(accountId) {
      var clients = sio.sockets.clients(accountId);
      return (clients.length > 0);
    };

    sio.set('authorization', function(data, accept) {
     var signedCookies = cookie.parse(data.headers.cookie);
     var cookies = utils.parseSignedCookies(signedCookies, app.sessionSecret);
     data.sessionId = cookies['express.sid'];

     data.sessionStore = app.sessionStore;
     data.sessionStore.get(data.sessionId, function(err, session) {
       if (err || !session) return accept('Invalid session', false);
       data.session = new Session(data, session);
       accept(null, true);
     });
    });
  });

  sio.sockets.on('connection', function(socket) {
    var session = socket.handshake.session;
    var accountId = session.accountId;
    var sAccount = null;

    socket.join(accountId);

    app.triggerEvent('event:' + accountId, {
      from: accountId,
      action: 'login'
    });

    var subscribeToAccount = function(accountId) {
      var eventName = 'event:' + accountId;
      app.addEventListener(eventName, handleContactEvent);
      console.log('Subscribing to ' + eventName);
    };

    var handleContactEvent = function(eventMessage) {
      socket.emit('contactEvent', eventMessage);
    };

    models.account.find(accountId, function(account) {
      sAccount = account;
      var subscribedAccount = {};
      account.contacts.forEach(function(contact) {
        if (!subscribedAccount[contact.accountId]) {
          subscribeToAccount(contact.accountId);
          subscribedAccount[contact.accountId] = true;
        }
      });

      if (!subscribedAccount[accountId]) {
        // Subscribe to my own updates
        subscribeToAccount(accountId);
      }
    });

    socket.on('chatClient', function(data) {
      sio.sockets.in(data.to).emit('chatServer', {
        from: accountId,
        text: data.text
      });
    });

    socket.on('disconnect', function() {
      sAccount.contacts.forEach(function(contact) {
        var eventName = 'event:' + contact.accountId;
        app.removeEventListener(eventName, handleContactEvent);
        console.log('Unsubscribing from ' + eventName);
      });

      app.triggerEvent('event:' + accountId, {
        from: accountId,
        action: 'logout'
      });
    });
  });
};
