define(['models/status', 'views/status', 'text!templates/profile.html',
        'text!templates/status.html'],

function(Status, StatusView, profileTemplate, statusTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    initialize: function() {
      this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(_.template(profileTemplate, this.model.toJSON()));

      var statuses = this.model.get('statuses');
      if (statuses == null) return;
      _.each(statuses, function(statusJson) {
        var statusModel = new Status(statusJson);
        var statusHtml = (new StatusView({ model: statusModel })).render().el;
        $(statusHtml).prependTo('.status-list').hide().fadeIn('slow');
      });
    }
  });
});
