var authMiddleWare = require('../middlewares/auth');
var config = require("../settings");

exports.signout = function(req, res) {
	req.session.destroy();
	res.clearCookie(config.auth_cookie_name, {path: "/"});
	res.redirect("/");
}