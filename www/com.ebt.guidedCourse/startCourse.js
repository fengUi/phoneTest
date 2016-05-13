define(['text!com.ebt.guidedCourse/startCourse.html',"text!com.ebt.guidedCourse/template/startCourse_template.html"],
	function(viewTemplate,startCourseTemplate) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_startCourse',
			events: {
                'click .startClick':'startClick',
                'click .top-title>img': 'return2',
			},
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+startCourseTemplate;
				me.html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				var that=this;
				
				that.renderContent();
			},
			getTemplate:function(tpl,data){
                return _.template(tpl)(data);
			},
			renderContent:function(){
			   var that=this;
			   var data={"result":{"subjects":[{"subjectName":"1有充分准备时间撤离","jtas":[{"jtaName":"机组协同","cJtas":[{"cJtaName":"确认飞行任务书","cJtaSubName":"特情处置协同"}]},{"jtaName":"起飞前准备","cJtas":[{"cJtaName":"舱门操作、滑梯预位","cJtaSubName":"安全示范、出口指示"}]}]},{"subjectName":"2有准备时限撤离","jtas":[{"jtaName":"起飞前准备","cJtas":[{"cJtaName":"安全示范、出口指示","cJtaSubName":"安全示范、出口指示"}]}]},{"subjectName":"3无准备撤离"}]}};
               var tpl=me.find("#startCourse_template").html();
               var conhtml=that.getTemplate(tpl,data);
               $("#content").html(conhtml)
			},
			startClick:function(){
               var url = 'com.ebt.guidedCourse/guidedCourse';
				this.navigateModule(url, {
					trigger: true
				});
			},
			//导航
			return2: function() {
				var url = 'com.ebt.course/course';
				this.navigateModule(url, {
					trigger: true
				});
			},
		}); //view define

	});