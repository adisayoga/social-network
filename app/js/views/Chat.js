define(['views/ChatSession', 'views/ChatItem', 'text!templates/chat.html'],

function(ChatSessionView, ChatItemView, chatTemplate) {
  return Backbone.View.extend({
    el: $('.chat'),

    chatSessions: {},

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
      this.collection.on('reset', this.renderCollection, this);
    },

    render: function() {
      this.$el.html(chatTemplate);
    },

    startChatSession: function(model) {
      var accountId = model.get('accountId');
      if (this.chatSessions[accountId]) return;
      var chatSessionView = new ChatSessionView({
        model:        model,
        socketEvents: this.socketEvents
      });
      chatSessionView.render();
      this.$el.prepend(chatSessionView.el);
      this.chatSessions[accountId] = chatSessionView;
    },

    renderCollection: function(collection) {
      var self = this;
      this.$('.chat-list').empty();
      collection.each(function(contact) {
        var chatItemView = new ChatItemView({
          model:        contact,
          socketEvents: self.socketEvents
        });
        chatItemView.bind('chat:start', self.startChatSession, self);
        chatItemView.render();
        self.$('.chat-list').append(chatItemView.el);
      });
    }

  });
});
