'use strict';

define(['text!templates/login.html'],

function(loginTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'login',
      'change input': 'resetError'
    },

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
    },

    render: function() {
      this.$el.html(loginTemplate);
      this.$('#login-error').hide();

      // TODO: Hapus ini
      this.$('#email').val('adisayoga@gmail.com');
      this.$('#password').val('password');
    },

    login: function() {
      var self = this;
      $.post('/login', this.$('form').serialize(), function(data) {
        self.socketEvents.trigger('app:loggedIn');
        window.location.hash = 'index';
      }).error(function(e) {
        self.$('#login-error').text(e.responseText).hide().fadeIn();
      });
      return false;
    },

    resetError: function() {
      this.$('#login-error').fadeOut();
    }

  });
});
