define(['text!com.ebt.ResultsUpload/resultsDetailScore.html', "text!com.ebt.ResultsUpload/template/resultsDetailScore_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/lessonNo", "i18n!../com.ebt.completeCourse/nls/completeCourse", '../base/date'],
	function(viewTemplate, lessonDetailScoreTemp, OpenAPI, Util, baseLocale, LessonNo, Locale, DateUtil) {
		return Piece.View.extend({
			id: 'com.ebt.ResultsUpload_resultsDetailScore',
			myScroll: null,
			subject_wrapper: null,
			events: {
				"click .leftTop": "goBack",
				"click .sub_list li": "chooseAside",
				
				
				
			},
			valid: false,
			
			goBack: function() {
				window.history.back();
			},
					
			
			renderTemp: function(data) {
				var that=this;
			
				var template = me.find("#resultsDetailScore_template").html();
				
				var websiteHtml = _.template(template)(data);
				
				$("#content").html("");
				$("#content").append(websiteHtml);
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});}
				
				
			},
			render: function() {
				//添加模板
				me = $(this.el);
				var viewTemp=_.template(viewTemplate,{lang:Locale})
				var viewT =viewTemp + lessonDetailScoreTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				
				var that = this;
				
				that.renderDetailTemp();
			
					            
				
			},
			renderDetailTemp:function(){
				var that=this;
				
				that.requestData();
			},
			chooseAside:function(e){
                var that = this;
				var $target = $(e.currentTarget);
				$target.addClass("sub_active").siblings().removeClass("sub_active");
				var index=$target.index()
				
				$(".jtas_item").eq(index).show().siblings().not(".jt_title").hide();
				that.myScroll.refresh();
				that.myScroll.scrollTo(0,0,100,false);
			},
			//请求得到课程详情
			requestData: function() {
				var data={};
				var that = this;
				var itemindex=Util.request("itemindex");
				var stuindex=Util.request("stuindex");
				var groupIndex=Util.request("groupIndex");
				var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
                var completeLesson=Piece.Store.loadObject(pendkey);
                var itemdata=completeLesson[itemindex];
                var studata=itemdata.groups[groupIndex].students[stuindex];
				data.lang = Locale;
				data.itemData=itemdata;
				data.stuDate=studata;
				that.renderTemp(data);
				console.log(data)
			},
		
		
			
		
			//end
		});

	});