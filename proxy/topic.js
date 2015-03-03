var eventProxy = require("eventproxy");
var Topic = require("../models").Topic;
var User = require("./user");
var Reply = require("./reply");
var _ = require("lodash");

/*根据主题ID获取主题*/
exports.getTopicById = function (id, callback) {
  var proxy = new eventProxy();
  var events = ['topic', 'author', 'last_reply'];
  proxy.assign(events, function (topic, author, last_reply) {
    if (!author) {
      return callback(null, null, null, null);
    }
    return callback(null, topic, author, last_reply);
  }).fail(callback);

  Topic.findOne({_id: id}, proxy.done(function (topic) {
    if (!topic) {
      proxy.emit('topic', null);
      proxy.emit('author', null);
      proxy.emit('last_reply', null);
      return;
    }
    proxy.emit('topic', topic);

    User.getUserById(topic.author_id, proxy.done('author'));

    if (topic.last_reply) {
      Reply.getReplyById(topic.last_reply, proxy.done(function (last_reply) {
        proxy.emit('last_reply', last_reply);
      }));
    } else {
		proxy.emit('last_reply', null);
    }
  }));
};

/*获取关键词能搜索到的主题数量*/
exports.getCountByQuery = function(query, callback) {
	Topic.count(query, callback);
};

/*根据关键词获取主题列表*/
exports.getTopicsByQuery = function(query,options, callback) {

	Topic.find(query, null, options, function(err, results) {	
		if (err) {
			return callback(err);
		}
		if (results.length == 0) {
			return callback(null, []);
		}

		var topics_id = _.pluck(results, "id");
		
		var proxy = new eventProxy();
		proxy.after("topic_ready", topics_id.length, function(topics){
			return callback(null, topics);//无错误信息，结果。callback中有触发topic事件的操作。
		});
		
		topics_id.forEach(function(id, index) {
			exports.getTopicById(id, proxy.group("topic_ready", function(topic, author, last_reply) {
				if (topic) {
					topic.author = author;
					topic.last_reply = last_reply;
					topic.friendly_create_at = new Date(topic.create_at);
				}
				return topic;
			}));
		});
	   
	});
};

/*获取所有消息的主题*/
exports.getFullTopic = function(id, callback) {
	var proxy = new eventProxy();
	var events = ['topic', 'author', 'replies'];
	proxy.assign(events, function(topic, author, replies) {
		callback(null, '', topic, author, replies);
	}).fail(callback);
	
	Topic.findOne({_id: id}, proxy.done(function(topic){
		if (!topic) {
			proxy.unbind();
			return callback(null, '此话题不存在或已被删除');
		}
		proxy.emit("topic", topic);
		User.getUserById(topic.author_id, proxy.done(function(author) {
			if (!author) {
				proxy.unbind();
				return callback(null, '话题的作者丢了');
			}
			proxy.emit('author', author);
		}));
	Reply.getRepliesByTopicId(topic._id, proxy.done('replies'));
	
	}));	
}

/*更新主题的最后回复消息*/
exports.updateLastReply = function(topicId, replyId, callback) {
	Topic.findOne({_id: topicId}, function(err, topic) {
		if (err || !topic) {
			return callback(err);
		}
		topic.last_reply = replyId;
		topic.last_reply_at = new Date();
		topic.reply_count += 1;
		topic.save(callback);
	});
};

/*根据主题ID查找一条主题*/
exports.getTopic = function(id ,callback) {
	Topic.findOne({_id: topicId}, "_id", callback);
};

exports.reduceCount = function(id, callback) {
	Topic.findOne({_id: id}, function(err, topic) {
		if (err) {
			return callback(err);
		}
		if (!topic) {
			return callback(new Error('该主题不存在'));
		}
		topic.reply_count -= 1;
		topic.save(callback);
	});
};

exports.newAndSave = function(title, content, authorId, callback) {
	var topic = new Topic();
	topic.title = title;
	topic.content = content;
	topic.author_id = authorId;
	topic.save(callback);
};


