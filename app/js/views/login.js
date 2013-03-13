define(['text!templates/login.html'], function(loginTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'login'
    },

    login: function() {
      var $el = this.$el;

      $.post('/login', {
        email:    $el.find('#email').val(),
        password: $el.find('#password').val()
      }, function(data) {
        console.log(data);
      }).error(function() {
        $el.find('#error').text('Unable to login.').slideDown();
      });

      return false;
    },

    render: function() {
      this.$el.html(loginTemplate);
      this.$el.find('#error').hide();
    }
  });
});
