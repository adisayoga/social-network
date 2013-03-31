define(['text!templates/status.html'],

function(statusTemplate) {
  return Backbone.View.extend({
    tagname: 'li',

    render: function() {
      $(this.el).html(_.template(statusTemplate, this.mode.toJSON()));
    }
  });
});
