define(['text!templates/index.html'], function(indexTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    render: function() {
      this.$el.html(indexTemplate);
    }
  });
});
