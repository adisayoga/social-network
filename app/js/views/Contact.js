define(['text!templates/contact.html'],

function(contactTemplate) {
  return Backbone.View.extend({
    addButton: false,
    removeButton: false,

    tagName: 'li',

    events: {
      'click .add-button': 'addContact',
      'click .remove-button': 'removeContact'
    },

    initialize: function() {
      // Set the addButton and removeButton variable in case it has been
      // added in the constructor
      this.addButton = this.addButton || this.options.addButton;
      this.removeButton = this.removeButton || this.options.removeButton;
    },

    render: function() {
      this.$el.html(_.template(contactTemplate, {
        model:        this.model.toJSON(),
        addButton:    this.addButton,
        removeButton: this.removeButton
      }));
    },

    addContact: function() {
      var $responseArea = this.$('.action-area');
      $.post('/accounts/me/contact', { contactId: this.model.get('_id') },
        function(data) {
          $responseArea.text('Contact added');
        }).error(function() {
          $responseArea.text('Could not add contact');
        });
    },

    removeContact: function() {
      var $responseArea = this.$('.action-area');
      $responseArea.text('Removing contact...');
      $.ajax({
        url:  '/accounts/me/contact',
        type: 'DELETE',
        data: { contactId: this.model.get('accountId') }
      }).done(function() {
        $responseArea.text('Contact removed');
      }).fail(function() {
        $responseArea.text('Could not remove contact');
      });
    }

  });
});
