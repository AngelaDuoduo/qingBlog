var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	loginname: {type:String},
	password: {type: String},
	url: {type: String},
	profile_image_url: {type: String},
	signature: {type: String},
	profile: {type: String},
	
	topic_count: {type: Number, default: 0},
	reply_count: {type:Number, default: 0},
	follower_count: {type: Number, default: 0},
	following_count: {type: Number, default: 0},
	collect_tag_count: {type: Number, default: 0},
	collect_topic_count: {type: Number, default: 0},
	create_at: {type: Date, default: Date.now},
	update_at: {type: Date, default: Date.now},
	active: {type: Boolean, default: false},
	
	retrieve_time: {type: Number},
	retrieve_key: {type: String}
});

UserSchema.index({loginname: 1}, {unique: true});
mongoose.model('User', UserSchema);


