require.config({
  paths: {
    jquery:     '/libs/jquery.min',
    underscore: '/libs/underscore.min',
    backbone:   '/libs/backbone.min',
    text:       '/libs/text',
    bootstrap:  '/libs/bootstrap.min',
    templates:  '../templates'
  },

  shim: {
    backbone:  ['underscore', 'jquery'],
    bootstrap: ['jquery'],
    socialNet: ['backbone', 'bootstrap']
  }
});

require(['socialNet'], function(socialNet) {
  socialNet.initialize();
});
