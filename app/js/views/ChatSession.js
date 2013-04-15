'use strict';

define(['text!templates/chat-session.html'],

function(chatItemTemplate) {
  return Backbone.View.extend({
    tagName: 'div',

    className: 'chat-session',

    events: {
      'submit form': 'sendChat'
    },

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
      var accountId = this.model.get('accountId');

      this.socketEvents.bind('socket:chat:in:' + accountId, this.receiveChat, this);
      this.socketEvents.bind('login:' + accountId, this.handleContactLogin, this);
      this.socketEvents.bind('logout:' + accountId, this.handleContactLogout, this);
    },

    render: function() {
      this.$el.html(_.template(chatItemTemplate, {
        model: this.model.toJSON()
      }));
      if (this.model.get('online')) this.handleContactLogin();
    },

    receiveChat: function(data) {
      var chatLine = '<strong>' + this.model.get('name').first + '</strong>: '
                   + data.text;
      this.$el.find('.chat-log ul').append('<li>' + chatLine + '</li>');
    },

    handleContactLogin: function() {
      this.model.set('online', true);
      this.$('.online-indicator').addClass('online');
    },

    handleContactLogout: function() {
      this.model.set('online', false);

      // $onlineIndicator = this.$('.online-indicator');
      // while ($onlineIndicator.hasClass('online'))
      //   $onlineIndicator.removeClass('online');

      // Apa bedanya dengan:
      this.$('.online-indicator').removeClass('online');
    },

    sendChat: function() {
      var chatText = this.$el.find('#chat').val();
      if (chatText && /[^\s]+/.test(chatText)) {
        var chatLine = '<strong>Me:</strong> ' + chatText;
        this.$el.find('.chat-log ul').append('<li>' + chatLine + '</li>');
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
