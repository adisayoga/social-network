define(['views/Contact', 'text!templates/contacts.html'],

function(ContactView, contactsTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    initialize: function() {
      this.collection.on('reset', this.renderCollection, this);
    },

    render: function() {
      this.$el.html(contactsTemplate);
    },

    renderCollection: function(collection) {
      collection.each(function(contact) {
        var contactView = new ContactView({ removeButton: true, model: contact });
        var statusHtml = contactView.render().el;
        $(statusHtml).appendTo('.contacts-list');
      });
    }

  });
});
