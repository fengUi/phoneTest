define([], function() {

	var View = Piece.View.extend({

		el: '#com.ebt.completeCourse-index',

		type: 'portal',

		render: function() {
			return this;
		},
		onShow: function() {
			//write your business logic here :)
		}
	});

	return View;

});