var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');

var config = require('config');

var RedisStore = require('connect-redis')(session);

var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL || config.redis.url);

var redisClient = require('redis').createClient(
  redisURL.port,
  redisURL.hostname,
  { no_ready_check: true }
);
if (redisURL.auth) {
  redisClient.auth(redisURL.auth.split(':')[1]);
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// session setup
app.use(session( {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || config.session.secret,
  resave: false,
  saveUninitialized: true
}));

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {

  redisClient.get('count', function (err, reply) {
    if (err) {
      throw err;
    }

    var count = reply;
    if (count === null) {
      count = 0;
    }

    if (!req.session.repeater) {
      redisClient.set('count', ++count);
      req.session.repeater = true;
    }

    res.render('index', { count: count });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
