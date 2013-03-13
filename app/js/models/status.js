define(

function() {
  return Backbone.Model.extend({
    urlRoot: '/accounts/' + this.accountId + '/status'
  });
});
