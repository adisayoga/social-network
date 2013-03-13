require.config({
  paths: {
    'jquery': '/libs/jquery',
    'underscore': '/libs/underscore',
    'backbone': '/libs/backbone',
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
