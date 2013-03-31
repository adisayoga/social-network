define(['models/Status', 'views/Status', 'text!templates/profile.html',
        'text!templates/status.html'],

function(Status, StatusView, profileTemplate, statusTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'postStatus'
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
    },

    render: function() {
      var self = this;
      this.$el.html(_.template(profileTemplate, this.model.toJSON()));

      var statuses = this.model.get('statuses');
      if (statuses == null) return;
      _.each(statuses, function(statusJson) {
        var statusModel = new Status(statusJson);
        self.prependStatus(statusModel);
      });
    },

    postStatus: function() {
      var self = this;
      var statusText = $('input[name="status"]').val();
      var collection = this.collection;
      $.post(
        '/accounts/' + this.model.get('_id') + '/status',
        { status: statusText },
        function(data) {
          self.prependStatus(new Status({ status: statusText }));
        }
      );
      return false;
    },

    prependStatus: function(statusModel) {
      var statusView = new StatusView({ model: statusModel });
      var statusHtml = statusView.render().el;
      $(statusHtml).prependTo('.status-list').hide().fadeIn('slow');
    }

  });
});
