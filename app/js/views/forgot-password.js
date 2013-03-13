define(['text!templates/forgot-password.html'], function(forgotPasswordTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      submit: 'forgotPassword'
    },

    forgotPassword: function() {
      var $el = this.$el;

      $.post('/forgot-password', {
        email: $el.find('#forgot-password').val()
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
