var express = require('express');
var passport= require('passport');
var Strategy = require('passport-local').Strategy;

var session = require('express-session');
var path = require('path');
var hbs = require('express-handlebars'); // підключаємо handlebars
var bodyParser = require('body-parser'); //для роботи з post даними
var authController = require('./controllers/authcontroller.js');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('handlebars', hbs({
	layoutsDir:__dirname + '/views'
}));

app.set('view engine', 'handlebars');

/******************
	LOGIN
*****************/
	// For Passport
	app.use(session({ secret: 'keyboard cat',resave: false, saveUninitialized:false}));
	app.use(require('morgan')('tiny'));
	app.use(require('cookie-parser')());

	app.use(passport.initialize());
	app.use(passport.session()); // login sessions

	app.get('/', function(req, res) {
		res.redirect('/login');
	});

/************
	users
************/
	var db = require('./db');
	passport.use(new Strategy(
		function(username, password, cb) {
			db.users.findByUsername(username, function(err, user) {
				if (err) { return cb(err); }
				if (!user) { return cb(null, false); }
				if (user.password !== password) { return cb(null, false); }
				return cb(null, user);
			});
		}
	));

	passport.serializeUser(function(user, cb) {
		cb(null, user.id);
	});

	passport.deserializeUser(function(id, cb) {
		db.users.findById(id, function (err, user) {
			if (err) { return cb(err); }
			cb(null, user);
		});
	});
/***********************************/
	app.get('/login', authController.signin);
	app.post('/login',
		passport.authenticate('local', {
			failureRedirect: '/login',
			successRedirect: '/page'
		})
	);
	app.get('/page', isLoggedIn, authController.page);

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();
		console.log("NOT LOGGED IN");
		res.redirect('/login');
	}

	app.get('/logout',
		function(req, res){
			req.logout();
			res.redirect('/login');
		});

	/*  404 */
	app.use(function(req,res,next){
		res.status(404);
		if(req.accepts('html')){
			res.render('404',{
				url:req.url
			});
		}
	});

	module.exports = app;
	app.listen(3000);