'use strict';

define(['models/Account', 'collections/Statuses', 'collections/Contacts',
        'views/Index', 'views/Register', 'views/Login', 'views/ForgotPassword',
        'views/Profile', 'views/Contacts', 'views/AddContact'],

function(Account, Statuses, Contacts, IndexView, RegisterView, LoginView,
         ForgotPasswordView, ProfileView, ContactsView, AddContactView) {
  var Workspace = Backbone.Router.extend({
    currentView: null,

    routes: {
      'index':           'index',
      'add-contact':     'addContact',
      'profile/:id':     'profile',
      'contacts/:id':    'contacts',
      'login':           'login',
      'register':        'register',
      'forgot-password': 'forgotPassword'
    },

    socketEvents: _.extend({}, Backbone.Events),

    changeView: function(view) {
      $('.navbar .nav > li').removeClass('active');

      if (this.currentView !== null) this.currentView.undelegateEvents();
      this.currentView = view;
      this.currentView.render();
    },

    index: function() {
      var statuses = new Statuses();
      statuses.url = '/accounts/me/activity';
      statuses.fetch();

      this.changeView(new IndexView({
        collection:   statuses,
        socketEvents: this.socketEvents
      }));
      $('.navbar .nav > .home').addClass('active');
    },

    addContact: function() {
      this.changeView(new AddContactView());
    },

    profile: function(id) {
      var model = new Account({ id: id });
      model.fetch();

      this.changeView(new ProfileView({
        model:        model,
        socketEvents: this.socketEvents
      }));
      $('.navbar .nav > .profile').addClass('active');
    },

    contacts: function(id) {
      var contactId = id || 'me';
      var contacts = new Contacts();
      contacts.url = '/accounts/' + contactId + '/contacts';
      contacts.fetch();

      this.changeView(new ContactsView({ collection: contacts }));
      $('.navbar .nav > .contacts').addClass('active');
    },

    login: function() {
      this.changeView(new LoginView({ socketEvents: this.socketEvents }));
    },

    register: function() {
      this.changeView(new RegisterView());
    },

    forgotPassword: function() {
      this.changeView(new ForgotPasswordView());
    }

  });

  return new Workspace();
});
