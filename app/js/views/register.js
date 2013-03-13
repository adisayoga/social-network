define(['text!templates/register.html'], function(registerTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      submit: 'register'
    },

    register: function() {
      var $el = this.$el;

      $.post('/register', {
        firstName: $el.find('#first-name').val(),
        lastName:  $el.find('#last-name').val(),
        email:     $el.find('#email').val(),
        password:  $el.find('#password').val()
      }, function(data) {
        console.log(data);
      });

      return false;
    },

    render: function() {
      this.$el.html(registerTemplate);
    }
  });
});
