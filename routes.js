var auth = require("./middlewares/auth");
var site = require('./controllers/site');
var user = require('./controllers/user');

//var posts = require("./routes/posts");
var reg = require("./controllers/reg");
var login = require("./controllers/login");
var logout = require("./controllers/logout");
var topic = require("./controllers/topic");
//var qingBlog = require("./routes/qingBlog");
//var favorite = require("./routes/favorite");


/*
app.use('/', home);
app.use('/user', users);
app.use("/posts", posts);
app.use("/reg", reg);
app.use("/login", login);
app.use("/logout", logout);
app.use("/qingBlog", qingBlog);
app.use("/favorite", favorite);
*/

module.exports = function(app) {
	app.get("/", site.index);
	app.get("/reg", reg.showRegPage);
	app.post("/reg", reg.signUp);
	app.get("/login", login.showLoginPage);
	app.post("/login", login.login);
	app.get("/logout", logout.signout);
	app.post("/logout", logout.signout);
	
	app.get("/topic/add", auth.userRequired, topic.addPage);
	app.post("/topic/add", topic.add);
	
	app.get("/user/:name", user.index);
	
	app.get("/topic/:tid", topic.index);
	app.get("/topic/:tid/edit", auth.userRequired, topic.showEdit);
	app.post('/topic/:tid/edit', auth.userRequired, topic.update);
	app.get("/topic/:tid/delete", auth.userRequired, topic.delete);

	app.get("/topic/:tid/reply", topic.index);
	app.post("/topic/:tid/reply", topic.addReply);
	
}