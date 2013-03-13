require.config({
  paths: {
    'jquery': '/libs/jquery.min',
    'underscore': '/libs/underscore.min',
    'backbone': '/libs/backbone.min',
    'text': '/libs/text',
    'templates': '../templates'
  },

  shim: {
    'backbone': ['underscore', 'jquery'],
    'social-net': ['backbone']
  }
});

require(['social-net'], function(socialNet) {
  socialNet.initialize();
});
