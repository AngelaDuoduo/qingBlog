var settingd = require("../settings");
var mongo = require("mongodb");
var Db = mongo.Db;
var Connection = mongo.Connection;
var Server = mongo.Server;

module.exports = new Db(settings.Db, new Server(settings.host, Connection.DEFAULT_PORT, {}));