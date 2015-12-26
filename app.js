var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
var customer = require('./routes/customer');
var restaurant = require('./routes/restaurant');

var ObjectID = require('mongodb').ObjectID;
var monk = require('monk')
var db = monk('localhost:27017/break-bread')

var app = express();

// Socket IO
var server = require('http').Server(app);
var io = require('socket.io')(server)

server.listen(80, function(){
    console.log("Socket.io on port %s", server.address().port);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions middleware
app.use(sessions({
    secret: 'kEayVt4t6i2RMtbtY8ch8OgrZ1INgCi2xEUgz+wgQpU=',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5,
    resave: false,
    saveUninitialized: true,
}));


// Index

db.get('restaurant').col.reIndex();

app.use(function(res, req, next){
    res.db = db;
    res.ObjectID = function (stringId){
        return ObjectID(stringId);
    }
    res.broadcastOrder = function(restaurantId, orderId){
        db.get('transaction').find( {_id: ObjectID(orderId), approved: { $in: ['true', 'pending']} })
            .success(function(order){
                console.log(order);
                io.sockets.emit(restaurantId.toString(), {
                    orderData: order
                });
            })
            .error(function(err){console.log(err);})
        };
    next();
});
app.use('/', routes);
app.use('/customer', customer);
app.use('/restaurant', restaurant);
app.use('/users', users);



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
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
