'use strict';

define(['models/Status'],

function(Status) {
  return Backbone.Collection.extend({
    model: Status
  });
});
