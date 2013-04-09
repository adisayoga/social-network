define(['sockets', 'collections/Contacts', 'views/Chat'],

function(sio, Contacts, ChatView) {
  return {
    eventDispatcher: null,
    socket: null,

    initialize: function(eventDispatcher) {
      this.eventDispatcher = eventDispatcher;
      eventDispatcher.bind('app:loggedIn', this.connectSocket, this);
    },

    connectSocket: function() {
      var self = this;
      this.socket = io.connect();

      this.socket
        .on('connect', function() {
          self.eventDispatcher.bind('socket:chat', self.sendChat, self);
          self.socket.on('chatServer', function(data) {
            self.eventDispatcher.trigger('socket:chat:start:' + data.from);
            self.eventDispatcher.trigger('socket:chat:in:' + data.from, data);
          });
          var contacts = new Contacts();
          contacts.url = '/accounts/me/contacts';
          contacts.fetch();
          var chatView = new ChatView({
            collection:   contacts,
            socketEvents: self.eventDispatcher
          });
          chatView.render();
        })

        .on('connect_failed', function(reason) {
          console.log('unable to connect', reason);
        });
    },

    sendChat: function(payload) {
      if (this.socket != null) this.socket.emit('chatClient', payload);
    }
  }
});
