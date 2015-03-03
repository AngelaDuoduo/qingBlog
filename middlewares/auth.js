var mongoose = require("mongoose");
var UserModel = require("../models").User;
var config = require("../settings");
var eventproxy = require("eventproxy");
var UserProxy = require("../proxy").User;
var Message = require('../proxy').Message;
var crypto = require('crypto');

exports.gen_session = function(user, res) {
	var auth_token = user._id + "$$$$";
	res.cookie(config.auth_cookie_name, auth_token,
	{path: "/", maxAge: 1000*60*60*24*30, signed: true, httpOnly: true});
};

exports.userRequired = function(req, res, next) {
	if (!req.session || !req.session.user) {
		res.status(403).send("forbidden");
		res.redirect("/");
	} 
	next();
};

// 验证用户是否登录
exports.authUser = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  if (req.cookies['mock_user']) {
    var mockUser = JSON.parse(req.cookies['mock_user']);
    req.session.user = new UserModel(mockUser);
    return next();
  }

  ep.all('get_user', function (user) {
    if (!user) {
      return next();
    }
    user = res.locals.current_user = req.session.user = new UserModel(user);

    Message.getMessagesCount(user._id, ep.done(function (count) {
      user.messages_count = count;
      next();
    }));

  });

  if (req.session.user) {
    ep.emit('get_user', req.session.user);
  } else {
    var auth_token = req.signedCookies[config.auth_cookie_name];
    if (!auth_token) {
      return next();
    }

    if (!auth_token) {
      res.cookie(config.auth_cookie_name, '', {signed: true});
      return res.redirect('/');
    }
    var auth = auth_token.split('$$$$');
    var user_id = auth[0];
    UserProxy.getUserById(user_id, ep.done('get_user'));
  }
};


