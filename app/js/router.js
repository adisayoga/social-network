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
      if (this.currentView != null) this.currentView.undelegateEvents();
      this.currentView = view;
      this.currentView.render();
    },

    index: function() {
      var statuses = new Statuses();
      statuses.url = '/accounts/me/activity';
      this.changeView(new IndexView({ collection: statuses }));
      statuses.fetch();
    },

    addContact: function() {
      this.changeView(new AddContactView());
    },

    profile: function(id) {
      var model = new Account({ id: id });
      this.changeView(new ProfileView({ model: model }));
      model.fetch();
    },

    contacts: function(id) {
      var contactId = id || 'me';
      var contacts = new Contacts();
      contacts.url = '/accounts/' + contactId + '/contacts';
      this.changeView(new ContactsView({ collection: contacts }));
      contacts.fetch();
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
