var APP_DIR = __dirname + '/../app',
    TEMPLATES_DIR = __dirname + '/templates';

var express = require('express'),
    app = express();

app.configure(function() {
  app.set('view engine', 'jade');
  app.use(express.static(APP_DIR));
});

app.get('/', function(req, res) {
  res.render(TEMPLATES_DIR + '/index.jade', { layout: false });
});

app.listen(8080);
