define(['text!com.ebt.ResultsUpload/ResultsBatch.html',
		'text!com.ebt.ResultsUpload/template/ResultsUpload_template1.html',
		
		'../base/util', '../base/openapi',
		'../base/date', "../com.ebt.ResultsUpload/nls/ResultsUpload"],
	function(viewTemplate, ResultsBatch_template1, Util, OpenAPI,DateUtil, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.ResultsUpload_ResultsBatch',
			events: {
				"click .edit": "edit_item",
				"click .del_item": "del_item_click",
				"click .backbtn": "backhome",
				"click .refresh": "refresh",
				"click .search": "showSearchDialog",
				"click .cancelBtn": "closeSearchDialog",
				"click .courseTime": "chooseCourseTime",
				"click .confirmBtn": "queryCourse",
				"click .uploadCourse": "submit",
				"click .course_item": "item_click",
				// "click .c_name":"detail",
				"click .goBack": "goBack",
				"click .skilledLevelItem": "chooseSkilledLevel"
			},
			data:[],
			goBack: function() {
				window.history.back();
			},
			myScroll: null,
			
			refresh: function() {
				this.onShow();
			},

			edit_item: function(e) {
				var that = this,
					$tar = $(e.currentTarget);
				$tar.toggleClass("active");
				$(".course_item_masker").toggle();
			},
			item_click: function(e) {
				var that = this;
				var $target = $(e.currentTarget);
				var className = e.target.className;

				// 点击编辑课程
				if ($(e.target).attr("data-dagou") === "dagou") {
					// 课程选择
					that.chooseCourse($target);
					return;
				}
				if (className === "c_name") {
					that.detail(e)
				}
				
				
			},
			detail:function(e){
					var that=this;
					var itemindex=$(e.currentTarget).attr("data-itemIndex");
                    var stuindex=$(e.currentTarget).attr("data-stuIndex");
                    var groupIndex=$(e.currentTarget).attr("data-groupIndex");
					var url="resultsDetailScore?itemindex="+itemindex+"&stuindex="+stuindex+"&groupIndex="+groupIndex;

					that.navigate(
						url,{trigger:true}
					)
			},
			chooseCourse: function($pars) {
				var that=this;
				if ($pars.attr("data-select") == "true") {
					$pars.attr("data-select", "false");
				} else {
					$pars.attr("data-select", "true");
				}
				$pars.find(".pass_state").toggle();
				var object = {};
				object.batchId = $pars.find(".pass_state").attr("data-batchId");
				object.stuId = $pars.find(".pass_state").attr("data-stuId");
				object.groupId = $pars.find(".pass_state").attr("data-groupId");

				object.Item = $pars.find(".pass_state").attr("data-Item");
				object.stuIndex = $pars.find(".pass_state").attr("data-stuIndex");
				object.groIndex = $pars.find(".pass_state").attr("data-groIndex");
				if($pars.attr("data-select")=="true"){
					if(that.fiterarr.length>0){
						for(var i=0;i<that.fiterarr.length;i++){
							if(that.fiterarr[i].batchId!=object.batchId||that.fiterarr[i].stuId!=object.stuId||that.fiterarr[i].groupId!=object.groupId){
								that.fiterarr.push(object);
								
								that.fiterarr=that.fiterarr.sort(function(a,b){
            					return b.groIndex-a.groIndex});
            					console.log(that.fiterarr);
								return
							}
						}
					}else{
						that.fiterarr.push(object);
						// console.log(that.fiterarr);
						that.fiterarr=that.fiterarr.sort(function(a,b){
            					return b.groIndex-a.groIndex});
						console.log(that.fiterarr);
						return
					}
				}else{
					for(var i=0;i<that.fiterarr.length;i++){
						if(that.fiterarr[i].batchId==object.batchId&&that.fiterarr[i].stuId==object.stuId&&that.fiterarr[i].groupId==object.groupId){
							that.fiterarr.splice(i,1);
							// console.log(that.fiterarr);
							that.fiterarr=that.fiterarr.sort(function(a,b){
            					return b.groIndex-a.groIndex});
							console.log(that.fiterarr);
							return
						}
					}
				}

			},
		
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
			//遍历全部机型
			eachAcType:function(data){
				var $skilledLevel = $("#skilledLevel");
				$skilledLevel.html("");
				// console.log(data)
				
				for(var i=0;i<data.length;i++){
					if(data[i].groups){
						for(var j=0;j<data[i].groups.length;j++){
							var $div;
							$div = $("<div/>", {
								text: data[i].groups[j].actypes.actype,
								class: "skilledLevelItem"
							});
							$skilledLevel.append($div);
						}
					}
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
				var StuName = $("#courseStu").val();
				var courseStartTime = $("#courseStartTime").html();
				var actype = $("#skilledLevel").attr("data-value");
				that.closeSearchDialog();
				var requestparam = {
					"year": courseYear.substr(0, 4),
					"courseYearperiod":courseYearperiod,
					"courseName": courseName,
					"actype": actype,
					"StuName": StuName,
					"courseStartTime": courseStartTime
					//"skilledLevel": skilledLevel
				};
				var queryResult =that.queryLessonList(requestparam);
				console.log(queryResult)
				$(".title").html(Locale.searchResult);
				
				// 
				if(queryResult.length!=0){
					console.log(that.renderData(queryResult[0]))
					that.renderTemp(that.renderData(queryResult[0]));
					$(".title").text("搜索结果");
					$("#skilledLevel").attr("data-value",null);
					$("#courseYear").html("");
					$("#courseYearperiod").html("");
					$("#courseName").val("");
					$("#courseStu").val("");
					$("#courseStartTime").html("");
					
				}else{
					console.log(that.renderData(queryResult))
					that.renderTemp(that.renderData(queryResult));
					$(".title").text("搜索结果");
					$("#skilledLevel").attr("data-value",null);
					$("#courseYear").html("");
					$("#courseYearperiod").html("");
					$("#courseName").val("");
					$("#courseStu").val("");
					$("#courseStartTime").html("");
					new Piece.Toast("无相关课程",8000);
					
				}

				
			},
			queryLessonList:function(param){
				var that=this;
				var count=0;
				var index=[];
				var groupIndex=[];
				var studentIndex=[];
				var completeLesson = Piece.Session.loadObject("completeLesson");
				if(that.data.length==0){
				
						that.data[0]=Piece.Session.loadObject("completeLesson");
					
				}	
				// console.log(completeLesson)
				console.log(that.data)
				for(var j=0;j<that.data.length;j++){
					for(var k=0;k<that.data[j].groups.length;k++){
						for(var l=0;l<that.data[j].groups[k].students.length;l++){
							if(param.year==""&&param.actype==null&&param.courseName==""&&param.StuName==""&&param.courseStartTime==""){
								completeLesson=that.data[j];

							}else if(param.year==""&&param.courseYearperiod==""&&param.StuName==	""&&param.courseStartTime==""&&param.actype!=null&&param.		courseName!=""){
										if(completeLesson.courseName.indexOf(param.courseName)==-1
											||completeLesson.actype!=param.actype)
											{
												index.push(j)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null		&&param.StuName==""&&param.courseStartTime==""&&param.			courseName!=""){
										if(completeLesson.courseName.indexOf(param.courseName)==-1)
											{
												index.push(j)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null		&&param.courseName==""&&param.StuName==""&&param.				courseStartTime==""){
										if(completeLesson.actype!=param.actype)
											{
												index.push(j)
											}

							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null		&&param.courseName==""&&param.StuName==""&&param.				courseStartTime==""){
										if(completeLesson.courseYear!=param.year
											||completeLesson.courseYearperiod!=param.courseYearperiod)
											{
												index.push(j)
											}

							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null		&&param.courseName!=""&&param.StuName==""&&param.				courseStartTime==""){
										if(completeLesson.courseName.indexOf(param.courseName)==-1
											||completeLesson.courseYear!=param.year
											||completeLesson.courseYearperiod!=param.courseYearperiod)
											{
												index.push(j)
											}

							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype!=null		&&param.courseName==""&&param.StuName==""&&param.				courseStartTime==""){
										if(completeLesson.actype!=param.actype
											||completeLesson.courseYear!=param.year
											||completeLesson.courseYearperiod!=param.courseYearperiod)
											{
												index.push(j)
											}

							//学生名字
							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null		&&param.courseName==""&&param.StuName!=""&&param.				courseStartTime==""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName)
											{
												
												studentIndex.push(l)
											}

							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null		&&param.courseName==""&&param.StuName!=""&&param.				courseStartTime==""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.courseYear!=param.year
											||completeLesson.courseYearperiod!=param.courseYearperiod)
											{
												index.push(j)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null		&&param.courseName==""&&param.StuName!=""&&param.				courseStartTime==""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.groups[k].actype!=param.actype)
											{
												groupIndex.push(k)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null		&&param.courseName==""&&param.StuName!=""&&param.				courseStartTime!=""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.groups[k].students[l].startTime!=param.courseStartTime)
											{
												studentIndex.push(l)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null		&&param.courseName!=""&&param.StuName!=""&&param.				courseStartTime==""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.courseName!=param.courseName)
											{
												index.push(j)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null		&&param.courseName!=""&&param.StuName!=""&&param.				courseStartTime==""){

										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.courseName!=param.courseName
											||completeLesson.groups[k].actype!=param.actype)
											{
												index.push(j)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null		&&param.courseName!=""&&param.StuName!=""&&param.				courseStartTime!=""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.courseName!=param.courseName
											||completeLesson.groups[k].students[l].startTime!=param.courseStartTime)
											{
												index.push(j)
											}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null		&&param.courseName!=""&&param.StuName!=""&&param.				courseStartTime==""){
						
										if(param.StuName!=completeLesson.groups[k].students[l].studentName
											||completeLesson.courseName!=param.courseName
											||completeLesson.groups[k].actype!=param.actype)
											{
												index.push(j)
											}

							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype!=null		&&param.courseName!=""&&param.StuName!=""&&param.				courseStartTime==""){
						
									if(param.StuName!=completeLesson.groups[k].students[l].studentName
										||completeLesson.courseName!=param.courseName
										||completeLesson.courseYear!=param.year
										||completeLesson.courseYearperiod!=param.courseYearperiod)
										{
											index.push(j)
										}

							}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null		&&param.courseName==""&&param.StuName!=""&&param.				courseStartTime!=""){
						
									if(param.StuName!=completeLesson.groups[k].students[l].studentName
										||completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.courseYear!=param.year
										||completeLesson.courseYearperiod!=param.courseYearperiod)
										{
											index.push(i)
										}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null		&&param.courseName!=""&&param.StuName!=""&&param.				courseStartTime!=""){
						
									if(param.StuName!=completeLesson.groups[k].students[l].studentName
										||completeLesson.groups[k].actype!=param.actype
										||completeLesson.courseName!=param.courseName
										||completeLesson.courseStartTime!=param.courseStartTime)
										{
											index.push(j)
										}

							}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null		&&param.courseName==""&&param.StuName==""&&param.				courseStartTime!=""){

									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime)
										{
											studentIndex.push(l)
										}

						}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null&&		param.courseName==""&&param.StuName==""&&param.courseStartTime!=		""){

									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.courseYear!=param.year
										||completeLesson.courseYearperiod!=param.courseYearperiod)
										{
											index.push(j)
										}

						}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&		param.courseName==""&&param.StuName==""&&param.courseStartTime!=		""){
									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.groups[k].actype!=param.actype)
										{
											groupIndex.push(k)
										}

						}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&		param.courseName!=""&&param.StuName==""&&param.courseStartTime!=		""){
									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.courseName!=param.courseName)
										{
											index.push(j)
										}

						}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype!=null&&		param.courseName==""&&param.StuName==""&&param.courseStartTime!=		""){
									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.courseYear!=param.year
										||completeLesson.courseYearperiod!=param.courseYearperiod
										||completeLesson.groups[k].actype!=param.actype)
										{
											index.push(j)
		                                                                                                                                                                                                                                                                                                    								}

						}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null&&		param.courseName!=""&&param.StuName==""&&param.courseStartTime!=		""){
									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.courseYear!=param.year
										||completeLesson.courseYearperiod!=param.courseYearperiod
										||completeLesson.courseName!=param.courseName)
										{
											index.push(j)
										}

						}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&		param.courseName!=""&&param.StuName==""&&param.courseStartTime!=		""){
									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime
										||completeLesson.groups[k].actype!=param.actype
										||completeLesson.courseName!=param.courseName)
										{
											index.push(j)
										}

						}else if(param.year!=""&&param.courseYearperiod!=""&&param.actype!=null&&		param.courseName!=""&&param.StuName==""&&param.courseStartTime!=		""){
									if(completeLesson.groups[k].students[l].startTime!=param.courseStartTime!=param.courseStartTime
										||completeLesson.courseYear!=param.year
										||completeLesson.courseYearperiod!=param.courseYearperiod
										||completeLesson.courseName!=param.courseName
										||completeLesson.groups[k].actype!=param.actype)
						{
							index.push(j)
						}
						}else if(
							completeLesson.courseYear!=param.year
							||completeLesson.courseYearperiod!=param.courseYearperiod
							||completeLesson.courseName.indexOf(param.courseName)==-1
							||completeLesson.groups[k].students[l].startTime!=param.courseStartTime
							||param.StuName!=completeLesson.groups[k].students[l].studentName
							||param.actype!=completeLesson.groups[k].actype
							){						
								index.push(j)
							}
						}
					}
				}
				// for(var j=0;j<index.length;j++){
				// 	that.data.splice(index[j]-count,1);
				// 	++count;
				// }
				if(index.length>0){
					for(var i=0;i<index.length;i++){
						that.data.splice(index[i]-count,1);
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
				}else if(studentIndex.length>0){
					for(var i=0;i<studentIndex.length;i++){
						for(var j=0;j<that.data.length;j++){
							for(var k=0;k<that.data[j].groups.length;k++){
								for(var l=0;l<that.data[j].groups[k].students.length;l++){
									that.data[j].groups[k].students[l].splice(studentIndex[i]-count,1);
									++count;
								}
							}
						}		
					}
				}
				
				// Piece.Session.saveObject("completeLesson",that.data);
				return that.data;
			},
		
			closeSearchDialog: function() {
				$(".searchDailog").hide();
				$(".masker").hide();
			},
			showSearchDialog: function() {
				$(".searchDailog").show();
				$(".masker").show();
			},
		
			setAutoTimeForQueryCourse: function() {
				var date = new Date();
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var lessonTime = DateUtil.dateFormat(date, "yyyy-MM-dd hh:mm");
				$("#lessonTime").text(lessonTime);
				$("#courseYear").text(year + Locale.year);
				if (month > 6) {
					$("#courseYearperiod").text(Locale.secHalfYear);
				} else {
					$("#courseYearperiod").text(Locale.firHalfYear);
				}
			},
			render: function() {
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板

				viewT = ResultsBatch_template1+viewT;

				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			
			
			requestData: function() {
				
			   	var that = this;
               
               	var completeLesson=Piece.Session.loadObject("uploadBatch");
               	
               	console.log(that.renderData(completeLesson))
               	that.data.push(completeLesson);
               	// console.log(that.data)
				that.renderTemp(that.renderData(completeLesson));
				
				
				that.setAutoTimeForQueryCourse();
			},
			renderData:function(data){
				var tempData = {};
				
				tempData.result = [];
				tempData.result.push(data)
				var obj={};
				for(var i=0;i<tempData.result.length;i++){
					if(tempData.result[i].startTime){
						var date = tempData.result[i].startTime.toString();
					}else if(tempData.result[i].batchStartTime){
						var date = tempData.result[i].batchStartTime.toString();
					}else{
						break;
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
				// 设置回头部(过滤的时候改了)
				

				var template = $(this.el).find("#ResultsUpload_template1").html();
				var websiteHtml = _.template(template, data.result);
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
				that.data=[];
				that.dataindex=0;
                that.groupindex=0;
				that.stuindex=0;
				that.fiterarr=[];
				$(".title").text("待上传————批次");
				that.requestData();
				

			},
		   
			submit:function(){
				var that=this;
               
				if (!Util.checkConnection()) {

						new Piece.Toast(baseLocale.network_not_available);
					} else {
						
					setTimeout(function(){
					    that.errResult=[];
				        that.sucResult=[];
						that.commit();
					},500)		
					}                          
			},
			
			
			uploadparam:function(dataitem,stu){
				var that=this;
				var datainfo={};
					datainfo.trainId=dataitem.trainId;
	                datainfo.batchId=dataitem.batchId;
	                datainfo.groupId=dataitem.groups[that.groupindex].groupId;
	                datainfo.stationCode=dataitem.groups[that.groupindex].stationCode;
	                datainfo.instructorId=dataitem.instructorId;
	                datainfo.startTime=stu.startTime; 
	                datainfo.endTime=stu.EndTime;  
                  
                    datainfo.gId=stu.gId;
                    datainfo.skill=stu.skill;
                    if(stu.common){
                    	datainfo.common=stu.common;
                    }
                     if(stu.otherInfo){
                    	datainfo.otherInfo=stu.otherInfo;
                    }
                   
                   
                    datainfo.scoreInfo=[];
                   for(var j=0;j<stu.subjects.length;j++){
                   	  
                       var subjectId=stu.subjects[j].subjectId;
                       for(var k=0;k<stu.subjects[j].jtas.length;k++){
                       	  for(var m=0;m<stu.subjects[j].jtas[k].cJtas.length;m++){
                       	  	   if(stu.subjects[j].jtas[k].cJtas[m].score){
                       	  	   	   var score={};
	                                score.subjectId=subjectId;
	                                score.cJtaId=stu.subjects[j].jtas[k].cJtas[m].cjtaId;
	                                score.scoreId=stu.subjects[j].jtas[k].cJtas[m].score.scoreId;
	                                score.remark=stu.subjects[j].jtas[k].cJtas[m].score.remark;
	                                datainfo.scoreInfo.push(score);
                       	  	   }
                               
                       	  }
                       }

                      
                      }
                      //alert(JSON.stringify(datainfo));
                      return datainfo;
                      

                      
			},
			dataindex:0,
			groupindex:0,
			stuindex:0,
			sucResult:[],
			errResult:[],
			fitler:function(Arr){
				var that=this;
				var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
	            var dataitem=Piece.Store.loadObject(pendkey);
	            var data=Piece.Session.loadObject("uploadBatch");
	            console.log(dataitem)
	            console.log(data)
                var count=0;
                var count1=0;
                var count2=0;
                var item=[]
                if(Arr.length>0){
                	 
                	 	
                	 		for(var j=0;j<data.groups.length;j++){

                	 			for(var k=0;k<data.groups[j].students.length;k++){

                	 				for(var a=0;a<Arr.length;a++){
                	 					if(data.groups[j].students.length==0){
                	 						continue;
                	 					}
                	 					if(Arr[a].studentId==data.groups[j].students[k].gId&&Arr[a].groupId==data.groups[j].groupId)
                	 					{
                	 						data.groups[j].students.splice(k-count,1);
                	 						count++;
                	 					}
                	 				}                    			
	                			}
	                			if(data.groups[j].students.length!=0){
	                				item.push(data.groups[j])
	                			}                			
	                		}
	                		data.groups=item;
	                		console.log(data);
                			console.log(dataitem);
               		for(var i=0;i<dataitem.length;i++){
               			if(dataitem[i].batchId==data.batchId){
               				dataitem[i]=data
               			}
               			if(dataitem[i].groups.length==0){
               				dataitem.splice(i--,1)
               			}
               		}
               		var ob = {};
               		ob.data=data;
               		ob.dataitem=dataitem
               		console.log(ob)
               	 	return ob;
                }
                
			},
			delitem:function(item,arr,groupIndex){
				var count=0;
				for(var i=0;i<arr.length;i++){
					if(arr[i].item==groupIndex){
						for(var j=0;j<item.groups.length;j++){
							if(item.groups[j].gIndex==groupIndex){
								for(var k=0;k<item.groups[j].students.length;k++){
									if(item.groups[j].students[k].stuIndex==arr[i].index){
										item.groups[j].students.splice(k-count,1);
                     					count++;
                     				}
								}
							}
						}
                     	
					}
					
				}
				return item;

			},
			//全局
			fiterarr:[],
			commit: function() {
				
				var that = this;
                console.log(that.data)
				if(that.data.length>0){

				
				if(that.fiterarr.length>0){
					for(var i=0;i<that.fiterarr.length;i++){
                        var batchIdCount=that.data[that.dataindex].batchId;
                        var groupIdCount=that.data[that.dataindex].groups[that.groupindex].groupId
                        var stuIdCount=that.data[that.dataindex].groups[that.groupindex].students[that.stuindex].gId;

	                   if(that.fiterarr[i].batchId==batchIdCount&&that.fiterarr[i].stuId==stuIdCount&&that.fiterarr[i].groupId==groupIdCount)
	                   {
	                       	 that.stuindex++;
	                    	 if(that.stuindex>=that.data[that.dataindex].groups[that.groupindex].students.length){
							     that.groupindex++;
							     that.stuindex=0;
							     if(that.groupindex>=that.data[that.dataindex].groups.length){
								 	that.delsucitem(that.errResult,that.sucResult);
								    return false;
							 	 }	
							 }
							 
	                   }
					}
				}
				var dataitem=that.data[that.dataindex];
				var datastu=dataitem.groups[that.groupindex].students[that.stuindex];
				var dataGroup=dataitem.groups[that.groupindex];
				var param=that.uploadparam(dataitem,datastu);
				console.log(dataitem)
                if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
						} else {

							Util.clearWarn(document.body);
							var url = OpenAPI.scoreUpload;
							Util.Ajax(
								url,
						        {
						        	data:JSON.stringify(param),
						            access_token:Piece.Session.loadObject("accessToken")

						        },
						        null,
								function(data, textStatus, jqXHR) {
									console.log(data)
									   if (data.resultCode === 0){
									   	 that.sucResult.push({"item":dataGroup.gIndex,"index":datastu.stuIndex,"groupId":dataGroup.groupId,"studentId":datastu.gId,"batchId":dataitem.batchId});
										
									   }else{
									   	 that.errResult.push({"item":dataGroup.gIndex,"index":datastu.stuIndex,"groupId":dataGroup.groupId,"studentId":datastu.gId,"batchId":dataitem.batchId});
									   }

								 },
								function(xhr, errorType, error){
		                               that.errResult.push({"item":dataGroup.gIndex,"index":datastu.stuIndex,"groupId":dataGroup.groupId,"studentId":datastu.gId,"batchId":dataitem.batchId});
								 },
								function(xhr, status){

									     that.stuindex++;

										if(that.stuindex>=dataitem.groups[that.groupindex].students.length){
											that.groupindex++;
											that.stuindex=0;
										}

										if(that.groupindex<that.data[that.dataindex].groups.length){
			                                setTimeout(function(){
			                                	that.commit();
			                                },500)		                               

										}else{
											that.delsucitem(that.errResult,that.sucResult);

										}
								 },
								 null,
								 null,
								 Util.REQUEST_TYPE,
								 "json"
							)


						};
				        
				
			   }	
			},
			delsucitem:function(errArr,sucArr){
                var that=this;
            	
				if(sucArr.length>0){
					for(var i=0;i<sucArr.length;i++){
					
						
						$("#course_item_"+sucArr[i].item+sucArr[i].index).remove();
						
					}
					var ob=that.fitler(sucArr)

                    var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
                    Piece.Store.saveObject(pendkey,ob.dataitem);
                    Piece.Session.saveObject("uploadBatch",ob.data);
	                
				}
				
                    var slen=sucArr.length;
                    var elen=errArr.length;
                    that.dataindex=0;
                    that.groupindex=0;
					that.stuindex=0;
					that.errResult=[];
					that.sucResult=[];
					// that.fiterarr=[];
			 
				that.commitResult(slen,elen);

				
				that.onShow();
			},
			
			//提交成功
			
			commitResult: function(slen,elen) {
				
				new Piece.Toast("上传成功"+slen+"个,上传失败"+elen+"个");
					
					
					
				
			}
		

		}); //view define

	});
