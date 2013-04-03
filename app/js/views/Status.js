define(['text!templates/status.html'],

function(statusTemplate) {
  return Backbone.View.extend({
    tagName: 'li',

    render: function() {
      this.$el.html(_.template(statusTemplate, this.model.toJSON()));
    }
  });
});
