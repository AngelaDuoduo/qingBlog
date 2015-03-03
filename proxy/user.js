var User = require("../models").User;

/*根据登录用户名返回用户对象*/
exports.getUserByLoginName = function(loginName, callback) {
	User.findOne({loginname: loginName}, callback);
};

/*插入用户*/
exports.newAndSave = function(loginName, pass, callback) {
	var user = new User();
	user.loginname = loginName;
	user.password = pass;
	user.save(callback);
};

/*根据用户名列表查找用户对象列表*/
exports.getUsersByNames = function(names, callback) {
	if (names.length === 0) {
		return callback(null, []);
	}
	User.find({loginname: {$in: names}}, callback);
};

/*根据用户ID， 查找用户*/
exports.getUserById = function(id ,callback) {
	User.findOne({_id: id}, callback);
};

exports.getUsersByIds = function(ids, callback) {
	User.find({'_id': {$in: ids}}, callback);
};

/*根据关键字，获取一组用户*/
exports.getUsersByQuery = function(query, opt, callback) {
	User.find(query, '', opt, callback);
};







