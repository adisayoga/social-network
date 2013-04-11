'use strict';

define(['sockets', 'models/Contacts', 'views/chat'],

function(io, Contacts, ChatView) {
  return {
    socket: null,
    eventDispatcher: null,

    initialize: function(eventDispatcher) {
      this.eventDispatcher = eventDispatcher;
      eventDispatcher.bind('app:loggedIn', this.connectSocket);
    },

    connectSocket: function() {
      var self = this;
      this.socket = io.connect();

      this.socket
        .on('connected', function() {
          self.eventDispatcher.bind('socket:chat', self.sendChat);

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

        .on('connectionFailed', function(reason) {
          console.log('Unable to connect', reason);
        });
    },

    sendChat: function(payload) {
      if (this.socket != null) this.socket.emit('chatClient', payload);
    }
  };
});
