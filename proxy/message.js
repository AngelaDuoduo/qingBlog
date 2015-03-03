var eventProxy = require("eventProxy");
var Message = require("../models").Message;

var User = require("./user");
var topic = require("./topic");
var Reply = require("./reply");

/*获取未读消息数目*/
exports.getMessagesCount = function(id, callback) {
	Message.count({master_id: id, has_read: false}, callback);
};

/*根据消息ID获取消息*/
exports.getMessagesById = function(id, callback) {
	
	Message.findOne({_id: id}, function(err, message) {
		if (err) {
			return callback(err);
		} 
		if (message.type === 'reply' || message.type === 'reply2') {
			var proxy = new eventProxy();
			proxy.assign('author_found', 'topic_found', 'reply_found', function(author, topic, reply) {
				message.author = author;
				message.topic = topic;
				message.reply = reply;
				
				/*意义是什么?*/
				if (!author || !topic) {
					message.is_invalid = true;
				} 
				return callback(null, message);				
			}).fail(callback);
			User.getUserById(message.authod_id, proxy.done('author_found'));
			Topic.getTopicById(message.topic_id, proxy.done('topic_found'));
			Reply.getReplyById(message.reply_id, proxy.done("reply_found"));
		}
		if (message.type === 'follow') {
			User.getUserById(message.author_id, function(error, author) {
				if (err) {
					return callback(err);
				}
				message.author = author;
				if (!author) {
					message.is_invalid = true;
				}
				return callback(null, message);
			});
		}
	});
};

exports.getUnreadMessagesByUserId = function(userId, callback) {
	Message.find({master_id: userId, has_read: false}, null, {sort: '-create_at'}, callback);
}; 

