define(['text!com.ebt.toBeFinish/toBeFinishBatch.html', 'text!com.ebt.toBeFinish/template/toBeFinishBatch_template.html', '../base/util', '../base/openapi', '../base/date', "i18n!../com.ebt.toBeFinish/nls/toBeFinish"],
	function(viewTemplate, toBeFinishBatch_template, Util, OpenAPI, DateUtil, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.toBeFinish_toBeFinishBatch',
			events: {
				"click .goBack": "backhome",
				"click .refresh": "refresh",
				"click .search": "showSearchDialog",
				"click .cancelBtn": "closeSearchDialog",
				"click #skilledLevel": "chooseLevel",
				"click .chooseCourseTime": "chooseCourseTime",
				"click .confirmBtn": "queryCourse",
				"click .course_item": "item_click",
				"click .skilledLevelItem": "chooseSkilledLevel"

			},
			$editCourse: "<div class='editCourse'></div>",
			ActypeArr: [],
			myScroll: null,
			backhome: function() {
				window.history.back();
			},
			refresh: function() {
				this.onShow();
			},
			item_click: function(e) {
				var that = this;
				var $target = $(e.currentTarget);
				var className = e.target.className;
				// 如果点到打钩和编辑的图像则不跳转
				if ($(e.target).attr("data-dagou") === "dagou") {
					// 课程选择
					that.chooseCourse($target);
					return;
				}else{
					var that = this;
					that.detail(e);
				}
				
			},
			detail:function(e){
				var that=this;
				console.log($(e.currentTarget))
				var itemindex=$(e.currentTarget).attr("data-resultsIndex");
				var batchId=$(e.currentTarget).attr("data-batchId");
				var stuindex=$(e.currentTarget).attr("data-stuIndex");
				var status =$(e.currentTarget).attr("data-status");
				var groupIndex =$(e.currentTarget).attr("data-groupIndex");
				if(status=="unfinish"){
					var url="com.ebt.guidedCourse/courseScore?itemindex="+itemindex+"&groupIndex="+groupIndex+"&edit=toBeFinish";
					that.navigateModule(
						url,{trigger:true}
					)
				}else{
					var url="editscore?itemindex="+itemindex+"&stuindex="+stuindex+"&groupIndex="+groupIndex+"&batchId="+batchId;
					that.navigate(
						url,{trigger:true}
					)
				}

			},
			fiterarr:[],
			chooseCourse: function($pars) {
				var that = this;
				if ($pars.attr("data-select") == "true") {
					$pars.attr("data-select", "false");
				} else {
					$pars.attr("data-select", "true");
				}
				$pars.find(".pass_state").toggle();
				var object = {};
				object.index = $pars.find(".pass_state").attr("data-Index");
				object.Item = $pars.find(".pass_state").attr("data-Item");
				if($pars.attr("data-select")=="true"){

					if(that.fiterarr.length>0){
						for(var i=0;i<that.fiterarr.length;i++){
							if(that.fiterarr[i].index!=object.index||that.fiterarr[i].Item!=object.Item){
								that.fiterarr.push(object);
								console.log(that.fiterarr);
								return
							}else{
								return;
							}
						}
					}else{
						that.fiterarr.push(object);
						console.log(that.fiterarr);
						return
					}
				}else{
					for(var i=0;i<that.fiterarr.length;i++){
						if(that.fiterarr[i].index==object.index||that.fiterarr[i].Item==object.Item){
							that.fiterarr.splice(i,1);
							console.log(that.fiterarr);
							return
						}else{
							return;
						}
					}
				}
			},
			//遍历全部机型
			eachAcType:function(data){
				var $skilledLevel = $("#skilledLevel");
				$skilledLevel.html("");
				console.log(data)
				
					for(var j=0;j<data[0].groups.length;j++){
						var $div;
						
						$div = $("<div/>", {
							text: data[0].groups[j].actypes.actype,
							class: "skilledLevelItem"
						});
						$skilledLevel.append($div);
						}
				
			},
			//技术级别样式
			chooseSkilledLevel: function(e) {
				$("#skilledLevel .skilledLevelItem").removeClass('skilledLevelActive');
				var $target = $(e.currentTarget);
				$target.addClass('skilledLevelActive');
				$("#skilledLevel").attr("data-value", $target.html());
			},
			queryCourse: function() {
				Util.clearWarn(document.body);
				var that = this;
				var courseYear = $("#courseYear").html();
				var courseYearperiod = $("#courseYearperiod").html();
				var courseName = $("#courseName").val();
				var actype = $("#skilledLevel").attr("data-value");
				that.closeSearchDialog();
				var requestparam = {
					"year": courseYear.substr(0, 4),
					"courseYearperiod":courseYearperiod,
					"courseName": courseName,
					"actype": actype
					//"skilledLevel": skilledLevel
				};
				var queryResult =that.queryLessonList(requestparam);
				console.log(queryResult)
				$(".title").html(Locale.searchResult);
				//that.renderTemp(that.renderData(that.data));
				console.log(that.renderData(queryResult).result)
				if(that.renderData(queryResult).result.length!=0){
					that.renderTemp(that.renderData(queryResult));
					$("#skilledLevel").attr("data-value",null);
					$("#courseYear").html("");
					$("#courseYearperiod").html("");
					$("#courseName").val("");
				}else{
					that.renderTemp(that.renderData(queryResult));
					$("#skilledLevel").attr("data-value",null);
					$("#courseYear").html("");
					$("#courseYearperiod").html("");
					$("#courseName").val("");
					new Piece.Toast("无相关课程",2000);
				}

			},
			queryLessonList:function(param){
				var that=this;
				var count=0;
				var index=[];
				var groupIndex=[];
				var completeLesson = Piece.Session.loadObject("completeLesson");
				for(var i=0;i<that.data.length;i++){
					for(var j=0;j<that.data[i].groups.length;j++){
						for(var k=0;k<that.data[i].groups[j].students.length;k++){
							if(param.year==""&&param.actype==null&&param.courseName==""){
								completeLesson=that.data;
							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&param.courseName!=""){
								if(completeLesson[i].courseName.indexOf(param.courseName)==-1
									||completeLesson[i].groups[j].actypes.actype!=param.actype)
								{
									groupIndex.push(i)
								}
							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null&&param.courseName!=""){
								if(completeLesson[i].courseName.indexOf(param.courseName)==-1)
								{
									index.push(i)
								}
							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&param.courseName==""){
								if(completeLesson[i].groups[j].actypes.actype!=param.actype)
								{
									groupIndex.push(i)
								}
							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null&&param.courseName==""){
								if(completeLesson[i].courseYear!=param.year
									||completeLesson[i].courseYearperiod!=param.courseYearperiod)
								{
									index.push(i)
								}
							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null&&param.courseName!=""){
								if(completeLesson[i].courseName.indexOf(param.courseName)==-1
									||completeLesson[i].courseYear!=param.year
									||completeLesson[i].courseYearperiod!=param.courseYearperiod)
								{
									index.push(i)
								}
							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype!=null&&param.courseName==""){
								if(completeLesson[i].groups[j].actypes.actype!=param.actype
									||completeLesson[i].courseYear!=param.year
									||completeLesson[i].courseYearperiod!=param.courseYearperiod)
								{
									groupIndex.push(i)
								}
							}else if(
								completeLesson[i].courseYear!=param.year
								||completeLesson[i].courseYearperiod!=param.courseYearperiod
								||completeLesson[i].courseName.indexOf(param.courseName)==-1
								||completeLesson[i].groups[j].actypes.actype!=param.actype)
								{
									index.push(i)
								}
						}
					}
				}
				if(index.length>0){
					for(var j=0;j<index.length;j++){
						that.data.splice(index[j]-count,1);
						++count;
					}
				}else if(groupIndex.length>0){
					for(var i=0;i<groupIndex.length;i++){
						for(var j=0;j<that.data.length;j++){
							for(var k=0;k<that.data[j].groups.length;k++){
								that.data[j].groups[k].splice(groupIndex[i]-count,1);
								++count;
							}
						}		
					}
				}
				Piece.Session.saveObject("completeLesson",that.data);
				return that.data;

			},
			//查询选择时间
			chooseCourseTime: function() {
				//调用（显示）系统原生选择日期的控件
				var courseYear = $("#courseYear").text().substr(0, 4);
				var courseYearperiod = $("#courseYearperiod").text();
				cordova.exec(function(obj) {
					//$(".chooseCourseTime").text(obj);
					var words = obj.split("-");
					$("#courseYear").text(words[0] + Locale.year);
					$("#courseYearperiod").text(words[1]);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [10, courseYear + '-' + courseYearperiod]);
			},
			//关闭查询
			closeSearchDialog: function() {
				$(".searchDailog").hide();
				$(".masker").hide();
			},
			//显示查询
			showSearchDialog: function() {
				var that = this;
				$(".searchDailog").show();
				$(".masker").show();
			},
			render: function() {
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板

				viewT = toBeFinishBatch_template + viewT;
				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			data:[],
			requestData: function() {
				var that = this;
               	var completeLesson=Piece.Session.loadObject("toBeFinishBatch");
               	
               	that.data.push(completeLesson);
				that.renderTemp(that.renderData(that.data));
				
			},
			renderData:function(data){
				var tempData = {};
				tempData.Locale = Locale;
				tempData.result = data;
				var obj={};
				for(var i=0;i<tempData.result.length;i++){
					if(tempData.result[i].startTime){
						var date = tempData.result[i].startTime.toString();
					}else{
						var date = tempData.result[i].batchStartTime.toString();
					}
					
					var stArr=date.split(" ");
					var stime=stArr[0].split("-");
					var month=stime[1];
					if(!obj[month]){
						obj[month]={}
						obj[month].month=month;
						obj[month].results=[];
						obj[month].results.push(tempData.result[i]);
					}else{
						obj[month].results.push(tempData.result[i])
					}
				}
				var monthitem=[]
				for(var key in obj){
					monthitem.push(obj[key])
				}
				tempData.result=monthitem;
				// console.log(tempData);
				return tempData;

			},
			renderTemp: function(data) {
				var that = this;
				Util.clearWarn(that.el);
				
				var template = $(this.el).find("#toBeFinishBatch_template").html();
				var websiteHtml = _.template(template, data);
				that.eachAcType(that.data);
				$("#scroller").html("");
				$("#scroller").append(websiteHtml);
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {
						// checkDOMChanges: true
					});
				}
			},
			onShow: function() {
				var that = this;
				console.log('进入未完成页面=============：');
				$(".title").text("待完成批次---"+Piece.Session.loadObject("toBeFinishBatch").batchName)
				that.data=[],
				that.requestData();
				//write your business logic here :)
			}

		}); //view define

	});