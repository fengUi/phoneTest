define(['text!com.ebt.teacherEvaluation/evaluationList.html', "text!com.ebt.teacherEvaluation/template/evaluationList_template.html", '../base/openapi', '../base/util',"i18n!../base/nls/messageResource",  "i18n!../com.ebt.teacherEvaluation/nls/evaluationList"],
	function(viewTemplate, templateContent, OpenAPI, Util, baseLocale, Locale) {
		
		return Piece.View.extend({
			id: 'com.ebt.teacherEvaluation_evaluationList',
			render: function() {
				var viewTemp=_.template(viewTemplate,{lang:Locale});
				var viewT=viewTemp+templateContent;
				me=$(this.el);
				me.html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			events:{
				"click .time.leftTop" : "goBack",
                "click .ev_href":"goEv",
                "click .search":"showdialog",
                "click #chooseCourseTime": "chooseCourseTime",
                "click .confirmBtn":"queryCourse",
                "click .cancelBtn":"closedialog"
			},
			chooseCourseTime: function() {
				//调用（显示）系统原生选择日期的控件
				var courseYear = $('#courseYear').text().substr(0, 4);
				var courseYearperiod = $('#courseYearperiod').text();
				cordova.exec(function(obj) {
					var words = obj.split("-");

					$("#courseYear").text(words[0] + Locale.year);
					$("#courseYearperiod").text(words[1]);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [10, courseYear + '-' + courseYearperiod]);
			},
			showdialog: function(e) {
				$(".searchDailog").show();
				$(".masker").show();
			},
			closedialog: function() {

				$(".searchDailog").hide();
				$(".masker").hide();
			},
			goBack: function() {
				window.history.back();
			},
			//跳转到评价
			goEv:function(e){
				var surveyId=$(e.currentTarget).attr("data-sid"); 
				var surveyResultId=$(e.currentTarget).attr("data-rid");
				var year=$(e.currentTarget).attr("data-year"); 
				var yearp=encodeURIComponent($(e.currentTarget).attr("data-yearp")); 

				var name=encodeURIComponent($(e.currentTarget).attr("data-name"));
						
				var url="feedBack?surveyId="+surveyId+"&surveyResultId="+surveyResultId+"&yearp="+yearp+"&name="+name+"&year="+year;
				var that=this;
				that.navigate(url,{trigger:true})
			},
			myScroll:null,
			//渲染模板
			renderTemp:function(data){
				var that=this;
				var tpl=me.find("#evaluationList_template").html();
				//data.lang=Locale;
				var evhtml=_.template(tpl,data);
				$("#scroller").html(evhtml);
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});}
			},
			//查询课程
			queryCourse: function() {
                Util.clearWarn(document.body);
				var that = this;
				var courseYear = $("#courseYear").html();
				var courseYearperiod = $("#courseYearperiod").html();
				var courseName = $("#courseName").val();
				
				that.closedialog();
				var queryparam = {
					"year": courseYear.substr(0, 4),
					"courseYearperiod": courseYearperiod,
					"courseName": courseName,
					
				};
				
				var data = that.queryEv(queryparam);
				
				$(".title").html(Locale.searchResult);
				that.renderTemp(data);
				if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
					
				}else{
				   
					Util.ResultWarn(document.body, Locale.nosearchResult);
				}
				
				
			},
			queryEv:function(param){
				var that=this;
                var EvKey = that._getEvKey("EvKey_");
				var data=Piece.Store.loadObject(EvKey, data);
				var key=[];
				var kcount=0;
				if(!Util.isNull(data)){
                data.result=that.filter(data.result,param,"year");
                for(var k=0;k<data.result.length;k++){
                	
                		data.result[k].surveys=that.filter(data.result[k].surveys,param,"item")
                	    if(data.result[k].surveys.length==0){
                              key.push(k);
                	    }
                }
                for(var j=0;j<key.length;j++){
                		 data.result.splice(key[j]-kcount,1);
                		 ++kcount;
                	}
	            }  
				console.log(data);
				return data;
			},
			filter:function(evitem,param,type){
				var index=[];
				var count=0;
				
                for(var i=0;i<evitem.length;i++){

                	if(type=="year"){
                		if(evitem[i].year!=param.year){
                		   index.push(i);
                	   }
                	}
                	if(type=="item"){
                        
                		if(evitem[i].courseYearperiod!=param.courseYearperiod||evitem[i].courseName.indexOf(param.courseName)==-1){
                		 
                		   index.push(i);
                		  
                	    }
                	}


                }
              
                console.log(index)
                	for(var j=0;j<index.length;j++){
                		 evitem.splice(index[j]-count,1);
                		 ++count;
                	}

                	
                return evitem;
			},
			_getEvKey: function(prefix) {
				if (!Util.isNull(prefix)) {
					return prefix + Piece.Session.loadObject(Util.CURRENT_USER_ID);
				} else {
					return null;
				}

			},
		
			renderElTemp:function(){
				var that=this;
				var url = OpenAPI.query_survey;
				
				var param = {
					"studentId": Piece.Session.loadObject("currentUserId"), 
					"access_token": Piece.Session.loadObject("accessToken")
				};
                console.log(param);

				that.requestAjax(url, param);
			},
			requestAjax: function(url, param) {
				
				var that = this;
				
				Util.Ajax(
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							data.lang = Locale;
							console.log(data);
							var EvKey = that._getEvKey("EvKey_");
				        	Piece.Store.saveObject(EvKey, data);
				        	
							that.renderTemp(data);
						} else {
							
							Util.ResultWarn(document.body, Locale.no_data);
						};
							
						
						
						
					},
					null,
					function() {},
					null
					);
			},
			setAutoTimeForQueryCourse: function() {
				var year = new Date().getFullYear() + Locale.year;
				var month = new Date().getMonth() + 1;
				$("#courseYear").text(year);
				if (month <6) {

					$("#courseYearperiod").text(Locale.firHalfyear);
				} else {
					$("#courseYearperiod").text(Locale.secHalfyear);
				}
			},
			onShow: function() {
				var that=this;
				if (!Util.checkConnection()) {
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					that.renderElTemp();


				}
				that.setAutoTimeForQueryCourse();
				
				
				
			}
		}); //view define

	});