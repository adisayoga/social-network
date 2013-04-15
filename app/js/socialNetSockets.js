'use strict';

define(['sockets', 'collections/Contacts', 'views/Chat'],

function(sio, Contacts, ChatView) {
  return {
    eventDispatcher: null,
    socket: null,
    accountId: '',

    initialize: function(eventDispatcher) {
      this.eventDispatcher = eventDispatcher;
      eventDispatcher.bind('app:logged_in', this.connectSocket, this);
    },

    connectSocket: function(accountId) {
      var self = this;
      this.accountId = accountId;
      this.socket = io.connect();

      this.socket
        .on('connect', function() {
          self.eventDispatcher.bind('socket:chat', self.sendChat, self);

          self.socket.on('chat_server', function(data) {
            self.eventDispatcher.trigger('socket:chat:start:' + data.from);
            self.eventDispatcher.trigger('socket:chat:in:' + data.from, data);
          });

          self.socket.on('contact_event', function() {
            self.handleContactEvent.apply(self, arguments);
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
      if (this.socket !== null) this.socket.emit('chat_client', payload);
    },

    handleContactEvent: function(eventObject) {
      var eventName = '';
      if (eventObject.from === this.accountId) {
        eventName = eventObject.action + ':me';
      } else {
        eventName = eventObject.action + ':' + eventObject.from;
      }
      this.eventDispatcher.trigger(eventName, eventObject);
    }
  };
});
