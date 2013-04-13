'use strict';

define(['text!templates/chat-item.html'],

function(chatItemTemplate) {
  return Backbone.View.extend({
    tagName: 'li',

    events: {
      'click': 'startChatSession'
    },

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
      var accountId = this.model.get('accountId');

      this.socketEvents.bind('socket:chat:start:' + accountId, this.startChatSession, this);
      this.socketEvents.bind('login:' + accountId, this.handleContactLogin, this);
      this.socketEvents.bind('logout' + accountId, this.handleContactLogout, this);
    },

    render: function() {
      this.$el.html(_.template(chatItemTemplate, {
        model: this.model.toJSON()
      }));
      if (this.model.get('online')) this.handleContactLogin();
    },

    startChatSession: function() {
      this.trigger('chat:start', this.model);
    },

    handleContactLogin: function() {
      this.model.set('online', true);
      this.$('.online-indicator').addClass('online');
    },

    handleContactLogout: function() {
      this.model.set('online', false);

      $onlineIndicator = this.$('.online-indicator');
      while ($onlineIndicator.hasClass('online'))
        $onlineIndicator.removeClass('online');

      // Apa bedanya dengan:
      // this.$('.online-indicator').removeClass('online');
    }

  });
});
