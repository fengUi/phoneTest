define(['text!com.ebt.editGroup/addGroup.html'],
	function(viewTemplate) {
		return Piece.View.extend({
			id: 'com.ebt.editGroup_addGroup',
			render: function() {
				$(this.el).html(viewTemplate);

				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
			}
		}); //view define

	});