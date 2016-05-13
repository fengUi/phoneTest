define(['text!com.ebt.course/chooseCourse.html', "text!com.ebt.course/template/chooseCourse_template.html", '../base/openapi', '../base/util'],
	function(viewTemplate, chooseCourseTemp, OpenAPI, Util) {
		return Piece.View.extend({
			id: 'com.ebt.course_chooseCourse',
			events: {
				"click .time_item": "beginCourse",
				"click .leftTop": "goBack"
			},
			
			goBack: function() {
				window.history.back();
			},
			beginCourse:function(e) {
				//判断是否连接网络
				//alert(Util.checkConnection());
				if(Util.checkConnection()){
					var that = this;
				    var $target = $(e.currentTarget);
					var courseId = Util.request("courseId");
					var url = "lessonDetail?courseId=" + courseId;
					that.navigate(url, {
						trigger: true
					});
				}
				
				},
			renderTemp: function() {
				var data={"result":{
					    "times":["整组考核1","个人考核2","个人考核3"]
					}};
				var template=me.find("#chooseCourse_template").html();
			   
				var sorthtml =_.template(template)(data);
				
				$("#groud").html(sorthtml);
				
			},
			render: function() {
				
				me = $(this.el);
				var viewT =viewTemplate + chooseCourseTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			title:function(){
				var courseId = Util.request("courseId");
                var data = Util.getDownloadCourse(courseId);
                $(".title ").text(data.result.courseName);
			},
			onShow: function() {
				
				var that=this;
				that.renderTemp();
				that.title();
				}
			
			
	
		}); 
		

	});