define(['text!templates/chat-session.html'],

function(chatItemTemplate) {
  return Backbone.View.extend({
    tagName: 'div',

    className: 'chat-session',

    $el: $(this.el),

    events: {
      'submit form': 'sendChat'
    },

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
      this.socketEvents.on(
        'socket:chat:in:' + this.model.get('accountId'),
        this.receiveChat,
        this);
    },

    render: function() {
      this.$el.html(_.template(chatItemTemplate, {
        model: this.model.toJSON()
      }));
    },

    receiveChat: function(data) {
      var chatLine = this.model.get('name').first + ': ' + data.text;
      this.$el.find('.chat-log').append('<li>' + chatLine + '</li>');
    },

    sendChat: function() {
      var chatText = this.$el.find('#chat').val();
      if (chatText && /[^\s]+/.test(chatText)) {
        var chatLine = 'Me: ' + chatText;
        this.$el.find('.chat-log').append('<li>' + chatLine + '</li>');
        this.socketEvents.trigger('socket:chat', {
          to:   this.model.get('accountId'),
          text: chatText
        });
        this.$el.find('#chat').val('');
      }
      return false;
    }

  });
});
