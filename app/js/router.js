define(['views/index', 'views/register', 'views/login', 'views/forgot-password'],
function(IndexView, RegisterView, LoginView, ForgotPasswordView) {
  return new Backbone.Router.extend({
    currentView: null,

    routes: {
      'index':           'index',
      'login':           'login',
      'register':        'register',
      'forgot-password': 'forgotPassword'
    },

    changeView: function(view) {
      if (this.currentView != null) this.currentView.undelegateEvents();
      this.currentView = view;
      this.currentView.render();
    },

    index: function() {
      this.changeView(new IndexView());
    },

    login: function() {
      this.changeView(new LoginView());
    },

    forgotPassword: function() {
      this.changeView(new ForgotPasswordView());
    },

    register: function() {
      this.changeView(new RegisterView());
    }

  });
});
