var eventProxy = require("eventproxy");
var validator = require("validator");
var User = require("../proxy").User;
var Topic = require("../proxy").Topic;
var TopicCollect = require("../proxy").TopicCollect;
var config = require("../settings");

exports.index = function(req, res) {
	var topic_id = req.params.topic_id;
	if (topic_id.length !== 24) {
		return res.render("error", {message: "此话题不存在或已经被删除"});
	}
	var ep = new eventProxy();
	ep.all("topic", "other_topics", "no_reply_topics", function(topic, other_topics, no_reply_topics) {
		console.log(topic);
		res.render("topic_index", {
			topic: topic,
			author_other_topics: other_topics,
			no_reply_topics: no_reply_topics
		});
	});
	Topic.getFullTopic(topic_id, ep.done(function(message, topic, author, replies) {
		if (message) {
			ep.unbind();
			return res.render("error", {message: message});
		}
		topic.friendly_create_at = new Date(topic.create_at);
		topic.friendly_update_at = new Date(topic.update_at);
		topic.author = author;
		topic.replies = replies;
		
		if (!req.session.user) {
			ep.emit("topic", topic);
		} else {
			TopicCollect.getTopicCollect(req.session.user._id, topic._id, ep.done(function(doc) {
				topic.in_collection = doc;
				ep.emit("topic", topic);
			}));
		}
		
		var options = {limit: 5, sort: '-last_reply_at'};
		var query = {author_id: topic.author_id, _id: {"$nin": [topic._id]}};
		Topic.getTopicsByQuery(query, options, ep.done('other_topics'));
		
		var options2 = {limit: 5, sort: '-create_at'};
		Topic.getTopicsByQuery({reply_count: 0}, options2, ep.done("no_reply_topics"));
			
	}));
};

exports.addPage = function(req, res) {
	res.render("topic_edit");
};

exports.add = function(req, res) {
	var title = validator.trim(req.body.title);
	var content = validator.trim(req.body.content);
	var proxy = new eventProxy();
	
	var editError;
	if (title === "") {
		editError = "标题不能是空的";
	} else if (title.length > 100) {
		editError = "标题字数太多";
	} else if (content === "") {
		editError = "内容不能为空";
	}
	
	if (editError) {
		res.status(422);
		return res.render("topic_edit", {
			edit_error: editError,
			title: title,
			content: content
		});
	}
	
	Topic.newAndSave(title, content, req.session.user._id, function(err, topic) {
		User.getUserById(req.session.user._id, proxy.done(function(user) {
			user.topic_count += 1;
			user.save();
			req.session.user = user;
			req.session.save();
		}));
		return res.redirect("/");
	});	
};

exports.showEdit = function(req, res) {
	var topic_id = req.params.tid;
	
	Topic.getTopicById(topic_id, function(err, topic) {
		if (!topic) {
			res.render("error", {message: "此话题不存在或已经被删除"});
			return;
		}
		
		if (String(topic.author_id) === String(req.session.user._id)) {
			res.render("topic_edit", {
				action: 'edit',
				topic_id: topic._id,
				title: topic.title,
				content: topic.content
			});
		} else {
			res.render("error", {message: "对不起，您不是话题作者，不能编辑此话题"});
		}
	});
};

exports.update = function(req, res, next) {
	var topic_id = req.params.tid;
	var title = req.body.title;
	var content = req.body.content;
	
	Topic.getTopicById(topic_id, function(err, topic) {
		if (!topic) {
			return render("error", {message: "话题不存在或已被删除"});
		}
		if (String(topic.author_id) == String(req.session.user._id)) {
			title = validator.trim(title);
			content = validator.trim(content);
			
			var editError = "";
			if (title === '') {
				editError = "标题不能为空";
			} else if (title.length > 100) {
				editError = "标题字数太多";
			}
			
			if(editError !== "") {
				return res.render("topic_edit", {
					action: "edit",
					edit_error: editError,
					topic_id: topic._id,
					content: content
				});
			}
			
			topic.title = title;
			topic.content = content;
			topic.update_at = new Date();
			topic.save(function(err) {
				if (err) {
					return next(next);
				}
				res.redirect("/topic/" + topic._id);
			});
		} else {
			res.render("error",{message: "对不起，您不能编辑此话题"});
		}
	})
};

exports.delete = function(req, res) {
	var topic_id = req.params.tid;
	
	Topic.getTopicById(topic_id, function(err, topic) {
		if (!topic) {
			res.render("error", {message: "此话题不存在或已经被删除"});
			return;
		}
		
		if (String(topic.author_id) !== String(req.session.user._id)) {
			console.log("here");
			res.render("error", {message: "对不起，您不是话题作者，不能删除此话题"});
			return;
		}
		topic.remove(function(err) {
			if (err) {
				res.render("error", {message: "删除错误"});
				return;
			}
			User.getUserById(req.session.user._id, function(err, user) {
				user.topic_count -= 1;
				user.save();
				req.session.user = user;
				req.session.save();
			});
			res.redirect("/");
		});
	});
};

