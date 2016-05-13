define(['text!com.ebt.ResultsUpload/ResultsUpload.html',
		'text!com.ebt.ResultsUpload/template/ResultsUpload_template.html',
		'../base/util', '../base/openapi',
		'../base/date', "../com.ebt.ResultsUpload/nls/ResultsUpload"],
	function(viewTemplate, ResultsUpload_template, Util, OpenAPI,DateUtil, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.ResultsUpload_ResultsUpload',
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
			goBack: function() {
				var that=this;
			
				var url="com.ebt.course/allCourse";
				that.navigateModule(url, {
					trigger: true
				});
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
					var that = this;
					var index = $target.attr("data-resultsindex");
					that.requestData(index);
				}
				if (className === "course_item_masker" || className === "del_item") {
					// that.editCourse($target);
					return;
				}
				
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
				object.item = $pars.find(".pass_state").attr("data-itemindex");
				
				if($pars.attr("data-select")=="true"){
					if(that.fiterarr.length>0){
						for(var i=0;i<that.fiterarr.length;i++){
							if(that.fiterarr[i].item!=object.item){
								that.fiterarr.push(object);
								console.log(that.fiterarr);
								return
							}
						}
					}else{
						that.fiterarr.push(object);
						console.log(that.fiterarr);
						return
					}
				}else{
					for(var i=0;i<that.fiterarr.length;i++){
						if(that.fiterarr[i].item==object.item){
							that.fiterarr.splice(i,1);
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
				//that.renderTemp(that.data);
				//console.log(that.renderData(that.data).result)
				//if(that.renderData(that.data).result.length!=0){
				//	that.renderTemp(that.renderData(that.data).result);
				//}else{
				//	that.renderTemp(that.renderData(that.data).result);
				//	new Piece.Toast("无相关课程",8000);
				//}
				console.log(that.renderData(queryResult).result)
				if(that.renderData(queryResult).result.length!=0){
					that.renderTemp(that.renderData(queryResult).result);
					$("#skilledLevel").attr("data-value",null);
					$("#courseYear").html("");
					$("#courseYearperiod").html("");
					$("#courseName").val("");
				}else{
					that.renderTemp(that.renderData(queryResult).result);
					$("#skilledLevel").attr("data-value",null);
					$("#courseYear").html("");
					$("#courseYearperiod").html("");
					$("#courseName").val("");
					new Piece.Toast("无相关课程",8000);
				}

				// if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
				// }else{
				// 	Util.ResultWarn(document.body, Locale.nosearchResult);

				// }
			},
			queryLessonList:function(param){
            
				var that=this;
				var count=0;
				var index=[];
				var completeLesson = Piece.Session.loadObject("completeLesson");
				for(var i=0;i<that.data.length;i++){
					if(param.year==""&&param.actype==null&&param.courseName==""){
						completeLesson=that.data;
					}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&param.courseName!=""){
						if(completeLesson[i].courseName.indexOf(param.courseName)==-1
							||completeLesson[i].actype!=param.actype)
						{
							index.push(i)

						}
					}else if(param.year==""&&param.courseYearperiod==""&&param.actype==null&&param.courseName!=""){
						if(completeLesson[i].courseName.indexOf(param.courseName)==-1)
						{
							index.push(i)
						}
					}else if(param.year==""&&param.courseYearperiod==""&&param.actype!=null&&param.courseName==""){
						if(completeLesson[i].actype!=param.actype)
						{
							index.push(i)
						}
					}
					else if(param.year!=""&&param.courseYearperiod!=""&&param.actype==null&&param.courseName==""){
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
						if(completeLesson[i].actype!=param.actype
							||completeLesson[i].courseYear!=param.year
							||completeLesson[i].courseYearperiod!=param.courseYearperiod)
						{
							index.push(i)
						}
					}else if(
						completeLesson[i].courseYear!=param.year
						||completeLesson[i].courseYearperiod!=param.courseYearperiod
						||completeLesson[i].courseName.indexOf(param.courseName)==-1
						||completeLesson[i].actype!=param.actype)
					{
						index.push(i)
					}

				}
				for(var j=0;j<index.length;j++){
					completeLesson.splice(index[j]-count,1);
					++count;
				}
				Piece.Session.saveObject("completeLesson",that.data);
				return completeLesson;
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

				viewT = ResultsUpload_template  +viewT;

				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			data:null,
			//添加索引
			propindex:function(dataitem){
			   var index=Util.request("index");
               for(var i=0;i<dataitem.length;i++){
               	 	if(index!=""){
               	 	 dataitem[i].itemindex=index;
               	 	}else{
                     dataitem[i].itemindex=i;
               	 	}
               	 	for(var j=0;j<dataitem[i].groups.length;j++){
               	 		for(var k=0;k<dataitem[i].groups[j].students.length;k++){
                        	dataitem[i].groups[j].students[k].stuindex=j;
               	 		} 
               	 	}
               	
               }
               return dataitem;
			},
			requestData: function(batchIndex) {
				
			   var that = this;
               var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
                // Piece.Store.deleteObject(pendkey)

               var completeLesson=Piece.Store.loadObject(pendkey);
               var index=Util.request("index");
               
               if(batchIndex!=undefined){
               		completeLesson=that.data[batchIndex]
               }
               
               if(completeLesson!=null){
               	  	if(index!=""&&batchIndex==undefined){
					  if(index>(completeLesson.length-1))
					  {
						  that.data=that.propindex(completeLesson);
						   Piece.Session.saveObject("completeLesson",that.propindex(completeLesson));
					  }else{
						  that.data=that.propindex([completeLesson[index]]);
						   Piece.Session.saveObject("completeLesson",that.propindex([completeLesson[index]]));
					  }
				 


	               }else if(index==""&&batchIndex==undefined){
	                   that.data=that.propindex(completeLesson);
					   Piece.Session.saveObject("completeLesson",that.propindex(completeLesson));
	               }else{
	               		console.log(that.data)
	               		var index=Util.request("index");
               			
               	 		if(index!=""){
               	 	 		completeLesson.itemindex=index;
               	 		}
               	 		for(var j=0;j<completeLesson.groups.length;j++){
               	 			for(var k=0;k<completeLesson.groups[j].students.length;k++){
                        		completeLesson.groups[j].students[k].stuindex=j;
               	 			} 
               	 		}
               	
						//用来上传
						Piece.Session.saveObject("uploadBatch",completeLesson);
						
	               }

               }
              
               
				
				// console.log(that.data)
				if(batchIndex!=undefined){
					var url = 'com.ebt.ResultsUpload/ResultsBatch';
                        this.navigateModule(url, {
                              trigger: true
                        });
				}else{
					that.renderTemp(that.renderData(that.data).result);
				}
				
				that.setAutoTimeForQueryCourse();
			},
			renderData:function(data,batchIndex){
				var tempData = {};
				tempData.Locale = Locale;
				tempData.result = data;
				var obj={};
				if(batchIndex!=undefined){
					for(var i=0;i<tempData.result.groups.length;i++){
						for(var j=0;j<tempData.result.groups[i].students.length;j++){
							
							var date = tempData.result.groups[i].students[j].startTime.toString();
							var stArr=date.split(" ");
							var stime=stArr[0].split("-");
							var month=stime[1];
							if(!obj[month]){
								obj[month]={}
								obj[month].month=month;
								obj[month].results=[];
								obj[month].results.push(tempData.result.groups[i].students[j]);
								// console.log(tempData.result)
							}else{

								obj[month].results.push(tempData.result.groups[i].students[j])
							}
							var monthitem=[]
							for(var key in obj){
								monthitem.push(obj[key])
							}
							tempData.result.students=monthitem;
							console.log(tempData);
						}
					}
				}else{
					for(var i=0;i<tempData.result.length;i++){
					var date = tempData.result[i].batchStartTime.toString();
					var stArr=date.split(" ");
					var stime=stArr[0].split("-");
					var month=stime[1];
					if(!obj[month]){
						obj[month]={}
						obj[month].month=month;
						obj[month].results=[];
						obj[month].results.push(tempData.result[i]);
						console.log(tempData.result[i])
					}else{

						obj[month].results.push(tempData.result[i])
					}
					}
					var monthitem=[]
					for(var key in obj){
						monthitem.push(obj[key])
					}
					tempData.result=monthitem;
					console.log(tempData);
				}
				
				
				return tempData;
			},
			renderTemp: function(data,batchIndex) {
				var that = this;
				Util.clearWarn(that.el);
				// 设置回头部(过滤的时候改了)
				$(".title").text(Locale.waittingUploadLesson);

				var template = $(this.el).find("#ResultsUpload_template").html();
				var websiteHtml = _.template(template, data);
				// that.eachAcType(data);
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
				that.dataindex=0;
				that.stuindex=0;
				that.groupindex=0;
				that.fiterarr=[];
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
			
			
			uploadparam:function(dataitem,stu,index){
				var datainfo={
			               	
			             };
					datainfo.trainId=dataitem.trainId;
	                datainfo.batchId=dataitem.batchId;
	                datainfo.groupId=dataitem.groups[index].groupId;
	                datainfo.stationCode=dataitem.groups[index].stationCode;
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
	            console.log(dataitem)
                var count=0;
                var count1=[];

                if(Arr.length>0){
                	 var arry=[]
                	 for(var i=0;i<dataitem.length;i++){
	                	var item=that.delitem(dataitem[i],Arr,i);
	                	
	                	for(var j=0;j<item.groups.length;j++){
	                		if(item.groups[j].students.length==0){
	                    		dataitem[i].groups.splice(j--,1)
	                    		
	                    	};
	                	}	                    
	                    
	                }
	                for(var i=0;i<dataitem.length;i++){
	                	if(dataitem[i].groups.length!=0){
	                		count1.push(dataitem[i])
	                	}	                    
	            	}
	            	console.log(count1)
	                
                }
               	
                return count1;
			},
			delitem:function(item,arr,index){
				var count=0;
				for(var i=0;i<arr.length;i++){
					if(arr[i].item==index){
						for(var j=0;j<item.groups.length;j++){
							for(var k=0;k<item.groups[j].students.length;k++){
								item.groups[j].students.splice(k-count,1);
                     			count++;
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
                        var iindex=that.data[that.dataindex].itemindex;
                        
	                   if(that.fiterarr[i].item==iindex){
							that.dataindex++;
							that.stuindex=0;
							if(that.dataindex>=that.data.length){
	                         	 that.delsucitem(that.errResult,that.sucResult);
								 return false;
							}
							
						  }	
	                   
					}
				}
				
				var dataitem=that.data[that.dataindex];
				var count = 0;
				var datastu=dataitem.groups[that.groupindex].students[that.stuindex];
				var param=that.uploadparam(dataitem,datastu,that.groupindex);
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
									   	 that.sucResult.push({"item":dataitem.itemindex,"index":datastu.stuIndex});
									   }else{
									   	 that.errResult.push({"item":dataitem.itemindex,"index":datastu.stuIndex});
									   }

								 },
								function(xhr, errorType, error){
		                               that.errResult.push({"item":dataitem.itemindex,"index":datastu.stuIndex});
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

										}
										else{
											that.dataindex++;
											that.groupindex=0;
											that.stuindex=0;
											if(that.dataindex>=that.data.length){
												
												that.delsucitem(that.errResult,that.sucResult);
												
											}else{
												setTimeout(function(){
			                                		that.commit();
			                                	},500)
											}
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
					
						
						$("#course_item_"+sucArr[i].item).remove();
						
					}
					var dataitem=that.fitler(sucArr)

                    var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
                    Piece.Store.saveObject(pendkey,dataitem);
	                
				}
				
                    var slen=sucArr.length;
                    var elen=errArr.length;
                    that.dataindex=0;
					that.stuindex=0;
					that.errResult=[];
					that.sucResult=[];
				
			 
				that.commitResult(slen,elen);
				that.onShow();
			},
			
			//提交成功
			
			commitResult: function(slen,elen) {
				
				new Piece.Toast("上传成功"+slen+"个,上传失败"+elen+"个");
					
					
					
				
			}
		

		}); //view define

	});
