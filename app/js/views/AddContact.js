define(['models/Contact', 'views/Contact', 'text!templates/add-contact.html'],

function(Contact, ContactView, addContactTemplate) {
  return Backbone.View.extend({
    el: $('.content'),

    events: {
      'submit form': 'search'
    },

    render: function(resultList) {
      this.$el.html(_.template(addContactTemplate));
      if (resultList == null) return;

      _.each(resultList, function(contactJson) {
        var contactModel = new Contact(contactJson);
        var contactView = new ContactView({ addButton: true, model: contactModel });
        var contactHtml = contactView.render().el;
        $('.results').append(contactHtml);
      });
    },

    search: function() {
      var self = this;
      $.post('/contacts/find', this.$('form').serialize(), function(data) {
        self.render(data);
      }).error(function() {
        $('.results').text('No contacts found.').slideDown();
      });
      return false;
    }

  });
});
