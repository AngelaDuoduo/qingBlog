var Reply = require("../models").Reply;
var eventProxy = require('eventProxy');

var User = require('./user');

/*获取一条回复信息*/
exports.getReply = function(id, callback) {
	Reply.findOne({_id: id}, callback);
};

/*根据回复ID， 获取回复*/
exports.getReplyById = function(id, callback) {
	Reply.findOne({_id: id}, function(err, reply) {
		if (err) {
			return callback(err);
		}
		if (!reply) {
			return callback(err, null);
		}
		
		var authod_id = reply.author_id;
		User.getUserById(authod_id, function(err, author) {
			if (err) {
				return callback(err);
			}
			if (!author) {
				return callback(error, null);
			}
			reply.author = author;
			reply.friendly_create_at = new Date();
		});
	});
};

/*根据主题Id, 或许回复列表。*/
exports.getRepliesByTopicId = function(id, callback) {
	Reply.find({topic_id: id}, "", {sort: 'create_at'}, function(err, replies) {
		if (err) {
			return callback(err);
		} 
		if (replies.length === 0) {
			return callback(null, []);
		}
		
		for (var j = 0; j < replies.length; j++) {
			var author_id = replies[j].author.id;
			(function(i) {
				User.getUserById(author_id, function(err, author) {
					if (err) {
						return callback(err);
					}
					replies[i].author = author || {_id: ''};
					replies[i].friendly_create_at = replies[i].create_at;
				});				
			}(j));
			
		}
	});
};

/*创建并保存一条回复信息*/
exports.newAndSave = function(content, topicId, authorId, replyId, callback) {
	if (typeof replyId === 'function') {
		callback = replyId;
		replyId = null;
	}
	var reply = new Reply();
	reply.content = content;
	reply.topic_id = topicId;
	reply.author_id = authorId;
	if (replyId) {
		reply.reply_id = replyId;
	}
	
	reply.save(function(err) {
		callback(err, reply);
	});
};

exports.getRepliesByAuthorId = function(authorId, opt, callback) {
	if (!callback) {
		callback = opt;
		opt = null;
	}
	Reply.find({author_id: authorId}, {}, opt, callback);
};

exports.getCountByAuthorId = function(authorId, callback) {
	Reply.count({author_id: authorId}, callback);
};
