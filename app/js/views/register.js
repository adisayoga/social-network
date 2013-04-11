'use strict';

define(['text!templates/register.html'],

function(registerTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'register'
    },

    render: function() {
      this.$el.html(registerTemplate);
    },

    register: function() {
      $.post('/register', this.$('form').serialize(), function(data) {
        console.log(data);
      });
      return false;
    }

  });
});
