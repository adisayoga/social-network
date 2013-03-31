define(['text!templates/forgot-password.html'],

function(forgotPasswordTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'forgotPassword'
    },

    render: function() {
      this.$el.html(forgotPasswordTemplate);
    },

    forgotPassword: function() {
      var email = $('#email').val();
      $.post('/forgot-password', { email: email }, function(data) {
        console.log(data);
      });
      return false;
    }

  });
});
