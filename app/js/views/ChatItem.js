'use strict';

define(['text!templates/chat-item.html'],

function(chatItemTemplate) {
  return Backbone.View.extend({
    tagName: 'li',

    events: {
      'click': 'startChatSession',
    },

    initialize: function(options) {
      options.socketEvents.bind(
        'socket:chat:start:' + this.model.get('accountId'),
        this.startChatSession,
        this);
    },

    render: function() {
      this.$el.html(_.template(chatItemTemplate, {
        model: this.model.toJSON()
      }));
    },

    startChatSession: function() {
      this.trigger('chat:start', this.model);
    }

  });
});
