define(['models/Status', 'views/Status', 'text!templates/index.html'],

function(Status, StatusView, indexTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'updateStatus'
    },

    initialize: function() {
      this.collection.on('add', this.onCollectionAdd, this);
      this.collection.on('reset', this.onCollectionReset, this);
    },

    render: function() {
      this.$el.html(indexTemplate);
    },

    onCollectionAdd: function(model) {
      var statusView = new StatusView({ model: model });
      statusView.render();
      this.$('.status-list').prepend(statusView.el).hide().fadeIn('slow');
    },

    onCollectionReset: function(collection) {
      var self = this;
      collection.each(function(model) {
        self.onCollectionAdd(model);
      });
    },

    updateStatus: function() {
      var statusText = this.$('#status').val();
      var statusCollection = this.collection;
      $.post('/accounts/me/status', { status: statusText }, function(data) {
        statusCollection.add(new Status({ status: statusText }));
      });
      this.$('#status').val('');
      return false;
    }

  });
});
