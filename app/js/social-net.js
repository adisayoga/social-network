define(['router'],

function(router) {
  var initialize = function() {
    checkLogin(runApplication);
  };

  var checkLogin = function(callback) {
    $.get('/account/authenticate', function() {
      callback(true);
    }).error(function() {
      callback(false);
    });
  };

  var runApplication = function(authenticated) {
    window.location.hash = authenticated ? 'index' : 'login';
    Backbone.history.start();
  };

  return { initialize: initialize };
});
