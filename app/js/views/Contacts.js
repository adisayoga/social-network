'use strict';

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
      var self = this;
      this.$('.contacts-list').empty();
      collection.each(function(contact) {
        var contactView = new ContactView({ removeButton: true, model: contact });
        contactView.render();
        self.$('.contacts-list').append(contactView.el);
      });
    }

  });
});
