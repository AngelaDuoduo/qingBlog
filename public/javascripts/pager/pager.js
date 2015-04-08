define(['jquery', 'widget'], function($, w){
	function Pager() {
		this.cfg = {
			total: 9,
			oneline: 5,
			handler4li: null
		};
		this.currentBoard = 1;
		this.currentPage = 1;
	}

	Pager.prototype = $.extend({}, new w.Widget(), {
		renderUI: function(options) {
			var content = $('<div class="duoduo-pager"><div class="pager-lastBoard"></div>\
							<div class="pager-lastPage">上一页</div>\
							<ul class="pager-list"></ul>\
							<div class="pager-nextPage">下一页</div>\
							<div class="pager-nextBoard"></div></div>');
			this.boundingBox.append(content);
			var str = "";
			for (var i = 1; i <= this.cfg.total;i++){
				str += '<li>' + i + '</li>';
			}
			this.boundingBox.find("ul")[0].innerHTML = str;
			this.refresh();
		},
		bindUI: function() {
			var list = this.boundingBox.find("li");
			var that = this;
			this.boundingBox.delegate("li", "click", function() {
				list.each(function() {
					$(this).removeClass("pager-active");
				});
				$(this).addClass("pager-active");
				that.currentPage = parseInt($(this).text().trim());
				that.cfg.handler4li($(this).text().trim());
				that.refresh();
			});

			this.boundingBox.delegate(".pager-lastPage", "click", function() {
				if (that.currentPage == (that.currentBoard - 1) * that.cfg.oneline + 1) {
					that.currentBoard -= 1;
					that.currentPage = that.currentBoard * that.cfg.oneline;
				} else {
					that.currentPage -= 1;
					that.cfg.handler4li(that.currentPage);
				}				
				that.refresh();
			});

			this.boundingBox.delegate(".pager-nextPage", "click", function() {
				if (that.currentPage == that.currentBoard * that.cfg.oneline) {
					that.currentBoard += 1;
					that.currentPage = (that.currentBoard - 1) * that.cfg.oneline + 1;
				} else {
					that.currentPage += 1;
					that.cfg.handler4li(that.currentPage);
				}				
				that.refresh();
			});

			this.boundingBox.delegate(".pager-lastBoard", "click", function() {
				that.currentBoard -= 1;
				that.currentPage = (that.currentBoard - 1) * that.cfg.oneline + 1;
				that.refresh();
			});

			this.boundingBox.delegate(".pager-nextBoard", "click", function() {
				that.currentBoard += 1;
				that.currentPage = (that.currentBoard - 1) * that.cfg.oneline + 1;
				that.refresh();
			});
		},
		refresh: function() {
			var total = this.cfg.total;
			var oneline = this.cfg.oneline;
			var start = (this.currentBoard - 1) * oneline + 1;
			var end = this.currentBoard * oneline;
			var totalBoard = Math.ceil(total / oneline);
			var list = this.boundingBox.find("li");
			for (var i = 0, len = list.length; i < len; i++) {
				if(i + 1 < start || i + 1 > end) {
					$(list[i]).hide();
				} else {
					$(list[i]).show();
				}
				if (i === this.currentPage - 1) {
					$(list[i]).addClass("pager-active");
				} else {
					$(list[i]).removeClass("pager-active");
				}
			}
			this.currentPage <= 1 ? $(this.boundingBox.find(".pager-lastPage")[0]).addClass("page-disable") :
										$(this.boundingBox.find(".pager-lastPage")[0]).removeClass("page-disable");
			this.currentBoard <= 1 ? $(this.boundingBox.find(".pager-lastBoard")[0]).addClass("board-disable"):
											$(this.boundingBox.find(".pager-lastBoard")[0]).removeClass("board-disable");
			this.currentPage >= total ? $(this.boundingBox.find(".pager-nextPage")[0]).addClass("page-disable"):
										  $(this.boundingBox.find(".pager-nextPage")[0]).removeClass("page-disable");	
			this.currentBoard >= totalBoard ? $(this.boundingBox.find(".pager-nextBoard")[0]).addClass("board-disable"):
												$(this.boundingBox.find(".pager-nextBoard")[0]).removeClass("board-disable");

		},
		pager: function($div, options) {
			this.boundingBox = $div;
			this.cfg = $.extend({}, this.cfg, options);
			if (options.currentPage) {
				this.currentPage = options.currentPage;
			}
			this.render();
			return this;
		}
	});	
	
	var pager = function(selector, options) {
		$(selector).each(function() {
			var self = $(this);
			new Pager().pager(self, options);
		});
	};

	return {
		pager: pager
	} 
});