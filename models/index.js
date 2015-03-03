var mongoose = require('mongoose');
var config = require('../settings');

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  } 
});

// models
require('./user');
require("./message");
require("./topic");
require("./reply");
require("./topic_collect");

exports.User = mongoose.model('User');
exports.Message = mongoose.model('Message');
exports.Topic = mongoose.model("Topic");
exports.Reply = mongoose.model("Reply");
exports.TopicCollect = mongoose.model("TopicCollect");
