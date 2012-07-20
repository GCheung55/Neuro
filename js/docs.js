window.addEvent('domready', function() {
	new moostrapScrollspy('sections', {
		onReady: function() {
			this.scroll();
		}
	});
});
