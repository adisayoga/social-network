'use strict';

define(['models/Contact', 'views/Contact', 'text!templates/add-contact.html'],

function(Contact, ContactView, addContactTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'search'
    },

    render: function(resultList) {
      var self = this;
      this.$el.html(_.template(addContactTemplate));
      if (resultList == null) return;

      _.each(resultList, function(contactJson) {
        var contactModel = new Contact(contactJson);
        var contactView = new ContactView({ addButton: true, model: contactModel });
        contactView.render();
        self.$('.results').append(contactView.el);
      });
    },

    search: function() {
      var self = this;
      $.post('/contacts/find', this.$('form').serialize(), function(data) {
        self.render(data);
      }).error(function() {
        self.$('.results').text('No contacts found.').slideDown();
      });
      return false;
    }

  });
});
