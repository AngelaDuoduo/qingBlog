/*controller*/
var eventProxy = require("eventproxy");
var User = require("../proxy").User;
var Topic = require("../proxy").Topic;
var config = require("../settings");

exports.index = function(req, res) {
  var page = parseInt(req.query.page,10) || 1;
  page = page > 0 ? page : 1;
  var limit = config.list_topic_count || 10;
  
  var proxy = new eventProxy();
  proxy.all("topics", "pages", function(topics, pages) {
	   res.render("index", {
		    topics: topics,
		    current_page: page,
		    list_topic_count: limit,
		    pages: pages,
		    base: "/"
	   });
  });  
  
  var options = {skip: (page - 1) * 10, limit: 10, sort:{ "create_at":-1}};
    var query = {};
    Topic.getTopicsByQuery(query, options, proxy.done("topics", function(topics) {
		    return topics;
    }));
    /*getCountByQuery的结果是匿名函数的参数。
	   函数作为proxy.done的参数时，proxy.done为形参函数装饰了异常处理功能。
    */
  Topic.getCountByQuery({}, proxy.done(function(all_topics_count) {
	     var pages = Math.ceil(all_topics_count / limit);
	     proxy.emit("pages", pages);
  }));
};
