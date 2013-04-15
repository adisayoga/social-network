'use strict';

define(['models/Status', 'views/Status', 'text!templates/profile.html',
        'text!templates/status.html'],

function(Status, StatusView, profileTemplate, statusTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'postStatus'
    },

    initialize: function(options) {
      this.socketEvents = options.socketEvents;
      this.model.bind('change', this.render, this);
    },

    render: function() {
      var self = this;
      if (this.model.get('_id')) {
        this.socketEvents.bind('status:' + this.model.get('_id'),
          this.onSocketStatusAdded, this);
      }

      this.$el.html(_.template(profileTemplate, this.model.toJSON()));

      var statuses = this.model.get('statuses');
      if (statuses === null) return;
      _.each(statuses, function(statusJson) {
        var statusModel = new Status(statusJson);
        self.prependStatus(statusModel);
      });
    },

    postStatus: function() {
      var data = { status: this.$('#status').val() };
      $.post('/accounts/' + this.model.get('_id') + '/status', data);
      this.$('#status').val('');
      return false;
    },

    onSocketStatusAdded: function(data) {
      var newStatus = data.data;
      this.prependStatus(new Status({
        status: newStatus.status,
        name:   newStatus.name
      }));
    },

    prependStatus: function(statusModel) {
      var statusView = new StatusView({ model: statusModel });
      statusView.render();
      this.$('.status-list').prepend(statusView.el).hide().fadeIn('slow');
    }

  });
});
