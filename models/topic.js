var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require("../settings");

var TopicSchema = new Schema({
	title: {type: String},
	content: {type: String},
	author_id: {type: ObjectId},
	reply_count: {type: Number, default: 0},
	collect_count: {type: Number, default: 0},
	create_at: {type: Number, default: Date.now},
	update_at: {type: Date, default: Date.now},
	last_reply: { type: ObjectId },
	last_reply_at: { type: Date, default: Date.now },
	content_is_html: {type: Boolean}
});

TopicSchema.index({create_at: -1});
TopicSchema.index({last_reply_at: -1});
TopicSchema.index({author_id: 1, create_at: -1});

mongoose.model("Topic", TopicSchema);