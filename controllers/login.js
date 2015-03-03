var validator = require("validator");
var eventProxy = require("eventproxy");
var User = require("../proxy/user");
var authMiddleWare = require("../middlewares/auth");

exports.showLoginPage = function(req, res) {
	req.session._loginReferer = req.headers.referer;
	console.log(req.headers.referer);
	res.render("login", {isError: false});
};

exports.login = function(req, res) {
	var loginname = validator.trim(req.body.loginname).toLowerCase();
	var password = validator.trim(req.body.password);
	
	var ep = new eventProxy();
	ep.on("login_error", function(code, msg) {
		res.status(code);
		res.render("login", {isError: true, error: msg});
	});
	
	if (!loginname || !password) {
		ep.emit("login_error", 422, "请填写用户名或者密码.");
	}
	
	User.getUserByLoginName(loginname, function(err, user) {
		if (err) {
			ep.emit("login_error", 422, "数据库出现异常，请稍后再试");
		} else if (!user) {
			ep.emit("login_error", 403, "该用户名不存在.");
		} else {
			var pass = user.password;
			if (pass && pass == password) {
				authMiddleWare.gen_session(user, res);
				var refer = req.session._loginRefer || '/';
				res.status(200);
				res.redirect("/");
			} else {
				ep.emit("login_error", 403, "密码错误.");
			}
		}
		
	});
};
