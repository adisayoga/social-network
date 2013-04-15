module.exports = function(app, models) {
  app.io.sockets.on('connection', function(socket) {
    var session = socket.handshake.session;
    var accountId = session.accountId;

    socket.join(accountId);

    socket.on('chat_client', function(data) {
      app.io.sockets.in(data.to).emit('chat_server', {
        from: accountId,
        text: data.text
      });
    });
  });
};
