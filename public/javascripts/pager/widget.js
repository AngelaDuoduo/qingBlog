define(['jquery'], function($) {
	function Widget() {
		this.handlers = {};
		this.boundingBox = null;
	}

	Widget.prototype = {
		on: function(type, handler) {
			if (typeof this.handlers[type] === 'undefined') {
				this.handlers[type] = [];
			}
			this.handlers[type].push(handler);
			return this;
		},
		fire: function(type, data){
			var handlers = this.handlers[type];
			if (handlers instanceof Array){
				for (var i = 0, len = handlers.length; i < len; i++) {
					handlers[i].apply(this, data);
				}
			}
			return this;
		},
		renderUI: function() {},
		bindUI: function(){},
		syncUI: function(){},
		render: function(container) {
			this.renderUI();
			this.handlers = {};
			this.bindUI();
			this.syncUI();			
		},
		destroy: function() {
			this.boundingBox.off();
			this.boundingBox.remove();
			this.boundingBox = null;
		}
	};

	return {
		Widget: Widget
	}
});