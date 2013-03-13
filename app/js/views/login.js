define(['text!templates/login.html'], function(loginTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'login',
      'change input': 'resetError'
    },

    login: function() {
      var $el = this.$el;

      $.post('/login', {
        email:    $el.find('#email').val(),
        password: $el.find('#password').val()
      }, function(data) {
        console.log(data);
      }).error(function() {
        $el.find('#login-error').text('Unable to login.').slideDown();
      });

      return false;
    },

    resetError: function() {
      this.$el.find('#login-error').slideUp();
    },

    render: function() {
      this.$el.html(loginTemplate);
      this.$el.find('#error').hide();
    }
  });
});
