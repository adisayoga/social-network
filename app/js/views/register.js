define(['text!templates/register.html'],

function(registerTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'register'
    },

    register: function() {
      $.post('/register', {
        firstName: $('#first-name').val(),
        lastName:  $('#last-name').val(),
        email:     $('#email').val(),
        password:  $('#password').val()
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
