define(['models/Contact'],

function(Contact) {
  return Backbone.Collection.extend({
    model: Contact
  });
});
