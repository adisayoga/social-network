define(['collections/statuses'],

function(Statuses) {
  return Backbone.Model.extend({
    urlRoot: '/accounts',

    initialize: function() {
      this.statuses     = new Statuses();
      this.statuses.url = this.urlRoot + '/' + this.id + '/status';
      this.activity     = new Statuses();
      this.activity.url = this.urlRoot + '/' + this.id + '/activity';
    }
  });
});
