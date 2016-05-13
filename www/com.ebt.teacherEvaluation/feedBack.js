define(['text!com.ebt.teacherEvaluation/feedBack.html','text!com.ebt.teacherEvaluation/template/feedBack_template.html', '../base/util', '../base/openapi', 'i18n!../base/nls/messageResource','i18n!../com.ebt.teacherEvaluation/nls/feedBack'],
	function(viewTemplate,feedtemplate, Util, OpenAPI,baseLocale,Locale) {
		return Piece.View.extend({
			id: 'com.ebt.teacherEvaluation_feedBack',
			events: {
				"click .leftTop": "goBack",
				"click .choose_list li":"appraise",
				"click .sub_btn":"subapp"
			},

			goBack: function() {
				
				window.history.back();
			},
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+feedtemplate;
				me.html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			myScroll:null,
			renderTemp:function(data){
				var that=this;
				var tpl=me.find("#feedBack_template").html();
				var tplhtml=_.template(tpl,data);
                $("#content").html(tplhtml);
                if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});}
				that.getR();
			},
			//生成选择项
			getdata:function(){
				var data={
					items:[]
				}
				$(".items_wrap .item").each(function(){
					var list=$(this).find(".itemlist");
					var item={};
					item.subjectId=list.attr("data-subjectid");
					var itemIds=[];
					list.find("li").each(function(){
						if($(this).hasClass("active")){
                            itemIds.push($(this).attr("data-itemid"))
						}
					})
					item.itemId=itemIds.join(",");
					data.items.push(item);
				})
				return data;
			},
			
			appraise:function(e){
				var that=this;
                 var $item=$(e.currentTarget);
                
                 var opt=$item.attr("data-opt");
               
                if(opt==0){
                
                    $item.addClass("active").siblings().removeClass("active")
                    
                  }else if(opt==1){
                      if($item.hasClass("active")){
                      	$item.removeClass("active");
                      }else{
                      	 $item.addClass("active");
                      }
                   
		           }

              
			},
		
			//提交评价
			subapp:function(){
				var that=this;
				var sugval=$(".suggest_area").val();
				var surveyId=Util.request("surveyId");
				var surveyResultId=Util.request("surveyResultId");
				var data=that.getdata();
				data.surveyId=surveyId;
				data.surveyResultId=surveyResultId;
				data.suggest=$.trim(sugval);
				
				that.commitFB(data);
			
			},
			commitFB: function(data) {
				
				var that = this;
        
				var param={
                   data:JSON.stringify(data),
                   access_token:Piece.Session.loadObject("accessToken")
				}
			
				if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
                   
					//Util.clearWarn(document.body);
					var url = OpenAPI.upload_survey;
											
					Util.Ajax(
				
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							console.log(data);
							that.commitSuccess(data);
							
			   					
							
						},
						null,
						function() {},
						null
						// ,that.paramsObj
					);
				};
				$(".suggest_area").val("");
			  
				
			},
			//提交成功
			
			commitSuccess: function(data) {
				var that=this;
				if (data.resultCode === 0) {
					
					new Piece.Toast(baseLocale.course_feedBack_success);
					setTimeout(function(){
				 
	                   var url="evaluationList"
				        that.navigate(url,{trigger:true})
					},600)
					
				} else {
					new Piece.Toast(baseLocale.course_feedBack_fail);
					
				}


				
			   
			},
			requestAjax: function(url, param) {
			
				var that = this;
				
				Util.Ajax(
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							console.log(data);
							data.lang=Locale;
							that.renderTemp(data);
							
						} else {
							
							
						};
						
						
					},
					null,
					function() {},
					null
					);
			},
			renderFBTemp:function(){
				var that=this;
				var url = OpenAPI.survey_detail;
				var surveyId=Util.request("surveyId");
				var param = {
					"surveyId":surveyId, 
					"access_token": Piece.Session.loadObject("accessToken")
				};

				that.requestAjax(url, param);
			},
			//得到url参数
			getR:function(){
				
				var year=Util.request("year");
				var yearp=decodeURIComponent(Util.request("yearp"))
				var name=decodeURIComponent(Util.request("name"))  
				
                $(".title").text(year+yearp+$(".title").text());
                $(".name").text(name);
			},
			
			onShow: function() {
				var that=this;
              
				if (!Util.checkConnection()) {
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					that.renderFBTemp();


				}
				
				//write your business logic here :)
			}
		}); //view define

	});