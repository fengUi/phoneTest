define(['text!com.ebt.guidedCourse/editpoint.html',"text!com.ebt.guidedCourse/template/editPoint_template.html"],
	function(viewTemplate,templateContent) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_editpoint',
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+templateContent;
				me.html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			events: {
				"click .skilledLevelItem": "chooseSkilledLevel",
				'click .sub_click':'subClick',
				'click .top-title>img': 'return2',
			},
			onShow: function() {
				var that=this;
				
				that.renderContent();
				that.iScroll();
			},
			//技术级别样式
			chooseSkilledLevel: function(e) {
				$("#skilledLevel .skilledLevelItem").removeClass('active');
				var $target = $(e.currentTarget);
				$target.addClass('active');
			},
			subClick:function(e){
				$(".sub_list .sub_click").removeClass('tActive');
				var $target = $(e.currentTarget);
				$target.addClass('tActive');
			},
			getTemplate:function(tpl,data){
                return _.template(tpl)(data);
			},
			renderContent:function(){
			   var that=this;
			   var data={"result":{"subjects":[{"subjectName":"1有充分准备时间撤离"},{"subjectName":"2有准备时限撤离"},{"subjectName":"3无准备撤离"}]}};
               var tpl=me.find("#editPoint_template").html();
               var conhtml=that.getTemplate(tpl,data);
               $("#content").html(conhtml)
			},
			//导航
			return2: function() {
				var url = 'com.ebt.course/course';
				this.navigateModule(url, {
					trigger: true
				});
			},
			iScroll: function() {
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {});
				}
			},
		}); //view define

	});