'use strict';

define(['router', 'socialNetSockets'],

function(router, socket) {
  return {
    initialize: function() {
      socket.initialize(router.socketEvents);
      this.checkLogin(this.runApplication);
    },

    checkLogin: function(callback) {
      $.get('/account/authenticated', function(data) {
        router.socketEvents.trigger('app:logged_in', data);
        callback(true);
      }).error(function() {
        callback(false);
      });
    },

    runApplication: function(authenticated) {
      if (!authenticated) {
        window.location.hash = 'login';
      } else {
        if (!window.location.hash) window.location.hash = 'index';
      }
      Backbone.history.start();
    }
  };
});
