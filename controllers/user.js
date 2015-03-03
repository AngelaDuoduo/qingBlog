var express = require('express');
var EventProxy = require("eventproxy");
var User = require("../proxy").User;
var Topic = require("../proxy").Topic;
var Reply = require("../proxy").Reply;


exports.index = function(req, res, next) {
	var username = req.params.name;
	User.getUserByLoginName(username, function(err, user) {
		if (err) {
			return next(err);
		}
		if (!user) {
			res.render("error", {message: "这个用户不存在"});
			return;
		}
		
		var proxy = new EventProxy();
		proxy.assign("recent_topics", "recent_replies", function(recent_topics, recent_replies) {
			user.friendly_create_at = new Date(user.create_at);
			res.render("user_index", {
				user: user,
				recent_topics: recent_topics,
				recent_replies: recent_replies,
				pageTitle: "@" + user.loginname + "的个人主页"
			});			
		});
		proxy.fail(next);
		
		var query = {author_id: user._id};
		var options = {limit: 5, sort:"-create_at"};
		Topic.getTopicsByQuery(query, options, proxy.done("recent_topics"));
		Reply.getRepliesByAuthorId(user._id, {limit: 20, sort:"-create_at"},
			proxy.done(function(replies) {
				var topic_ids = [];
				for (var i = 0; i < replies.length; i++) {
					if (topic_ids.indexOf(replies[i],topic_id.toString()) < 0) {
						topic_id.push(replies[i].topic_id.toString());
					}
				}
				var query = {_id: {"$in": topic_ids}};
				var opt = {limit: 5, sort: "-create_at"};
				Topic.getTopicsByQuery(query, opt, proxy.done("recent_replies"));
			}));
	});
};
	



