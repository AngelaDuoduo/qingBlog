/*开源包依赖*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var bodyParser = require('body-parser');
var MongoStore = require("connect-mongodb");
var authMiddleWare = require("./middlewares/auth");


/*应用模块引入*/
var settings = require("./settings");
var routes = require("./routes");


/*初始化app实例*/
var app = express();

//配置静态页面的位置和模板引擎。app.set(), 参数设置。
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(settings.session_secret));
app.use(session({
	secret: settings.session_secret,
	store: new MongoStore({
		url: settings.db
	}),
	resave: true,
	saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

//这句是用来做用户是否存了cookie或者session的验证啊55555找了一下午。
app.use(authMiddleWare.authUser);

//url-mapping
routes(app);


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

app.listen(8100, function() {
	console.log("Server start!");
});
module.exports = app;
