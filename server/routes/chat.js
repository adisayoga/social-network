module.exports = function(app, models) {
  var io      = require('socket.io'),
      connect = require('connect'),
      cookie  = require('cookie'),
      Session = connect.middleware.session.Session,
      utils   = connect.utils;

  var sio = io.listen(app.server);
  sio.configure(function() {
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
    socket.join(accountId);

    socket.on('chatClient', function(data) {
      sio.sockets.in(data.to).emit('chatServer', {
        from: accountId,
        text: data.text
      });
    });
  });

};
