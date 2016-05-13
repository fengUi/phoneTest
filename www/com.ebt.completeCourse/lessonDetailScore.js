define(['text!com.ebt.completeCourse/lessonDetailScore.html', "text!com.ebt.completeCourse/template/lessonDetailScore_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/lessonNo", "i18n!../com.ebt.completeCourse/nls/completeCourse", '../base/date'],
	function(viewTemplate, lessonDetailScoreTemp, OpenAPI, Util, baseLocale, LessonNo, Locale, DateUtil) {
		return Piece.View.extend({
			id: 'com.ebt.course_lessonDetailScore',
			myScroll: null,
			subject_wrapper: null,
			events: {
				"click .leftTop": "goBack",
				"click .sub_list li": "chooseAside",
				"click .complain":"complain",
				"click .cancelBtn":"closedialog",
				"input .contentText": "wordsTip",
				"click .subBtn":"commit",
				
				
			},
			valid: false,
			//关闭弹出框
			closedialog:function(){
                $('.contentText').val("");
                $(".masker").hide();
				$(".complainDialog").hide();
			},
			goBack: function() {
				window.history.back();
			},
					
			myScroll:null,
			renderTemp: function(data) {
				var that=this;
			
				var template = me.find("#lessonDetailScore_template").html();
				
				var websiteHtml = _.template(template)(data);
				
				$("#content").html("");
				$("#content").append(websiteHtml);
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});}
				var status=Util.request("flag");
				if(status==1){
                   $(".complain").hide();
				}

				
				
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
				that.arr=[];
				if (!Util.checkConnection()) {
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					that.renderDetailTemp();
				}
					            
				
			},
			renderDetailTemp:function(){
				var that=this;
				var url = OpenAPI.queryLessonScore;
				var id=Util.request("resultId");
				var param = {
					"resultId":id ,
					"access_token": Piece.Session.loadObject("accessToken")
				};

				that.requestAjax(url, param);
			},
			chooseAside:function(e){
                var that = this;
				var $target = $(e.currentTarget);
				$target.addClass("sub_active").siblings().removeClass("sub_active");
				var index=$target.index()
				
				$(".jtas_item").eq(index).show().siblings().not(".jt_title").hide();
				
			},
			//请求ajax得到课程详情
			requestAjax: function(url, param) {
				
				var that = this;
				
				Util.Ajax(
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							
							console.log(data);
							data.lang = Locale;
							that.renderTemp(data);
						} else {
							//$('#scroller').html('');
							
						};
						
						
					},
					null,
					function() {},
					null
					);
			},
			//显示申诉
			complain:function(e){
				var that=this;
				
				var target=$(e.currentTarget);
				var resultId=Util.request("resultId");
				var subjectId=target.attr("data-value");
                var param={
                	"resultId":resultId,
                	"subjectId":subjectId
                };
				$(".complainDialog").attr("data-value",JSON.stringify(param));
				$(".masker").show();
				$(".complainDialog").show();
				var tip = Locale.input + 1000 + Locale.word;
				$('.wordsTip').text(tip);
			},
			count:0,
			arr:[],
			//最多输入1000字，检测输入了多少字
			wordsTip: function() {
				var content=$('.contentText').val();
				var that=this;

				// that.arr=[]
				// if($('.contentText').val().split("\n")){
				// 	arr=$('.contentText').val().split("\n")
				// 	console.log(arr.length-1);
				// }
				// if(arr.length==0){
				// 	var wordLen = 1000-content.length;
				// }else{
				// 	var wordLen = 1000-content.length-(arr.length-1);
				// }
				var wordLen=0
				for (var i = 0; i < content.length; i++) {        
        			if (content.charCodeAt(i) < 27 || content.charCodeAt(i) > 126) { 
            		// 全角    
            			wordLen += 2; 
        			} else { 
            			wordLen++; 
        			} 
    			} 
				// if(1000-wordLen<=0){
				// 	wordLen=0;
				// }
				var count=1000-wordLen;
				if(count<=0){
					count=0;
				}
				var tip = Locale.input + count + Locale.word;
				$('.wordsTip').text(tip);
			},
			
			
			commit: function() {
				
				var that = this;
				var param;
				var content = $('.contentText').val().replace(/\s/g, '');

				var param = $(".complainDialog").attr("data-value");
				param = JSON.parse(param);
				
				if (content == '') {
					Piece.Toast(Locale.content);
				} else {
					param.content = content;
					param.access_token = Piece.Session.loadObject("accessToken");
					
					if (!Util.checkConnection()) {

						new Piece.Toast(baseLocale.network_not_available);
					} else {
                       
						//Util.clearWarn(document.body);
						var url = OpenAPI.newFeedback;
												
						Util.Ajax(
					
							url,
							param,
							function(xhr, settings) {},
							function(data, text, jqHRX) {
								that.commitSuccess(data);
								
							},
							null,
							function() {},
							null
							// ,that.paramsObj
						);
					};
					$('.contentText').val("");
					$('.masker').hide();
					$('.complainDialog').hide();
					that.arr=[];
				}
			},
			//提交成功
			
			commitSuccess: function(data) {
				if (data.resultCode === 0) {
					
					new Piece.Toast(baseLocale.course_feedBack_success);
				} else {
					new Piece.Toast(baseLocale.course_feedBack_fail);
					
				}
			}
		
			//end
		});

	});