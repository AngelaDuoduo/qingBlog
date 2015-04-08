require.config({
	paths: {
		'jquery': "jquery-1.11.1"
	}
});
require(['jquery', 'pager'], function($, pager){
	pager.pager(".pager", {
		total: pages || 10,
		oneline: pages <= 5? pages : 5,
		currentPage: currentPage,
		handler4li: function(page) {
			window.location.href = "/?page=" + page;
		}
	});
});