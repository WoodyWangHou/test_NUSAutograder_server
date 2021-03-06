var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var winston = require('winston');
var expressWinston = require('express-winston');
var MongoDB_Winston = require('winston-mongodb').MongoDB;

var user = require('./models/user');

var verifyDashboardRequest = require('./utils/dashboard-request-verification');
var verifyInstructor = require('./utils/verify-instructor');
var verifyStudent = require('./utils/verify-student');

var config = require('./config');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
	console.log("Connected correctly to server");
});

var index = require('./routes/index');
var users = require('./routes/users');
var students = require('./routes/students');
var instructors = require('./routes/instructors');

var app = express();
app.use(favicon(path.join(__dirname, 'public', 'logo.ico')));
app.use(logger('dev'));
app.use(expressWinston.logger({
	transports:[
		new winston.transports.MongoDB({
		db:config.mongoUrl,
		level:'info',
		collection:'allLog',
		json:true,
		timestamp:true
	})
	]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use('/users', users);
app.use('/students',students);
app.use('/instructors',instructors);

app.use(verifyDashboardRequest);
app.use(express.static(path.join(__dirname, 'public/src/dashboard')));

app.use(verifyInstructor);
app.use(express.static(path.join(__dirname, 'public/src/instructor/home-main')));

app.use(verifyStudent);
app.use(express.static(path.join(__dirname, 'public/src/student/home-main')));

app.use(express.static(path.join(__dirname, 'public')));

// WINSTON ERROR LOGGING
app.use(expressWinston.errorLogger({
	transports:[
		new (winston.transports.MongoDB)({
		db:config.mongoUrl,
		level:'warn',
		collection:'errorLog',
		json:true,
		timestamp:true
	}),
		new (winston.transports.File)({
			filename:'./error.log',
			level:'warn',
			json:true,
			timestamp:true
		})
	],
	level: function() {
    return 'warn';
  }
}));

// catch 404 and forward to error handler
app.use(function(err,req, res, next) {
	if(err.status == 404){
		err.data = "Can not find";
		res.status(404).json(err);
	}else{
		next(err);
	}
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log("Error occurs:"+err);
  console.log(err.stack);
  res.status(err.status || 500).
	json(err.data);
});

module.exports = app;
