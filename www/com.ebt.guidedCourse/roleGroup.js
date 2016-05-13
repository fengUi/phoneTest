define(['text!com.ebt.guidedCourse/roleGroup.html','text!com.ebt.guidedCourse/template/roleGroup_template.html'],
	function(viewTemplate,roleGroupTemp) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_roleGroup',
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+roleGroupTemp;
				me.html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			events:{
				'click .next':'goScore',
				'click .top-title>img': 'return2',
				'click .roleGrolItem': 'chooseSkill',
			},
			goScore:function(){
				var that=this;
				var url = "courseScore";
				that.navigate(url, {
					trigger: true
				});
			},
			renderTemp:function(){
				var data={
					"result":{
						   "students":[{"studentName":232323},{"studentName":232323},{"studentName":232323}]
						}
					
					};
				var template=me.find("#roleGroup_template").html();
				
			    var tpl=_.template(template,data);
				$(".roleGroupCont").html(tpl)
			},
		    //导航
			return2: function() {
				var url = 'com.ebt.guidedCourse/guidedCourse';
				this.navigateModule(url, {
					trigger: true
				});
			},
			//技术级别样式
			chooseSkill: function(e) {
				$("#roleGros .roleGrolItem").removeClass('roleActive');
				var $target = $(e.currentTarget);
				$target.addClass('roleActive');
			},
			onShow: function() {
				var that=this;
				that.renderTemp();
			},

			});

	});