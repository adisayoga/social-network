define(['text!templates/forgot-password.html'],

function(forgotPasswordTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'forgotPassword'
    },

    forgotPassword: function() {
      $.post('/forgot-password', {
        email: $('#email').val()
      }, function(data) {
        console.log(data);
      });
      return false;
    },

    render: function() {
      this.$el.html(forgotPasswordTemplate);
    }
  });
});
