define(['text!com.ebt.course/courseStuInfo.html', "text!com.ebt.course/template/courseStuInfo_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/courseall", '../base/date'],
    function(viewTemplate, courseStuInfoTemp, OpenAPI, Util, baseLocale, Locale, DateUtil) {
       	return Piece.View.extend({
			id: 'com.ebt.course_courseStuInfo',
			render: function() {
				/*var viewTemp = _.template(viewTemplate, {
					lang: Locale
				})*/
				me = $(this.el)
				me.html(viewTemplate + courseStuInfoTemp);

				Piece.View.prototype.render.call(this);
				return this;
			},
			
			events: {
				"click .begin_course":"beginCourse",
				"click .edit_group":"beginGroup"
			
			},
			beginCourse:function(){
				
				var that=this;
			    var url = "com.ebt.guidedCourse/roleGroup"
				that.navigateModule(url, {
					trigger: true
				});
			
			},
			beginGroup:function(){
				var that=this;
				var url="com.ebt.editGroup/batchlist";
				that.navigateModule(url, {
					trigger: true
				});

			},
		    
			//刷新
			refresh: function() {
				this.onShow();
			},
			renderTemp: function(data) {
				var data={"result":{"groups":[{"groupNo":1,"students":[{"studentName":123},{"studentName":"张三"},{"studentName":"air"}]},{"groupNo":2,"students":[{"studentName":123},{"studentName":"air"},{"studentName":"air"}]}]}}
				var template = me.find('#courseStuInfo_template').html();
				var webSite = _.template(template, data);
				
				$('#content').append(webSite);
				
			},
			//得到本地缓存数据
			requestData: function() {
                var that = this;
                var courseId = Util.request("courseId");
                var data = Util.getDownloadCourse(courseId);
                if (!Util.isNull(data)) {
                    data.lang = Locale;
                    that.renderTemp(data);
                } else {
                    new Piece.Toast(baseLocale.request_fail);
                }
            },
			
			onShow: function() {
				//write your business logic here :)
				var that = this;
				that.renderTemp();
				//that.requestData()
				//判断网络
			   if(Util.checkConnection()){

			   }
			}
		}); 

	});