'use strict';

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
      var statusText = this.$('#status').val();
      var collection = this.collection;
      $.post(
        '/accounts/' + this.model.get('_id') + '/status',
        { status: statusText },
        function(data) {
          self.prependStatus(new Status({ status: statusText }));
        }
      );
      this.$('#status').val('');
      return false;
    },

    prependStatus: function(statusModel) {
      var statusView = new StatusView({ model: statusModel });
      statusView.render();
      this.$('.status-list').prepend(statusView.el).hide().fadeIn('slow');
    }

  });
});
