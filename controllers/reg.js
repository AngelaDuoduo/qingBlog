var validator = require("validator");
var eventProxy = require("eventproxy");
var User = require("../proxy/user");

exports.showRegPage = function(req, res) {
	res.render("reg", {isError: false});
}
exports.signUp = function(req, res) {
	var loginname = validator.trim(req.body.loginname).toLowerCase();
	var password = validator.trim(req.body.password);
	var rePassword = validator.trim(req.body.re_password);
	
	var ep = new eventProxy();
	ep.on("prop_err", function(msg) {
		res.status(422);
		res.render('reg', {isError: true, error: msg});
	});
	
	if([loginname, password, rePassword].some(function(item){return item == "";})) {
		ep.emit("prop_err", "请填写完整信息!");
		return;		
	}
	if (loginname.length < 6) {
		ep.emit("prop_err", "用户名至少为6位.");
		return;
	}
	if (password !== rePassword) {
		return ep.emit("prop_err", "两次密码输入不一致。");
	}
	
	User.getUserByLoginName(loginname, function(err, user) {
		if (user) {
			ep.emit('prop_err', '用户名已经被使用.');
			return;
		} else {
			User.newAndSave(loginname, password, function() {
				console.log("new user added.");
			});
			res.redirect("/login");
			return;
		}
	});	
};