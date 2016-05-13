define(['text!com.ebt.editGroup/grouplist.html',"text!com.ebt.editGroup/template/grouplist_template.html",
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource',
		"../base/date"],
	function(viewTemplate,viewTemplatecontent, Util, openApi, baseLocale, DateUtil) {
		var temp,action;
		var place,batch;
		return Piece.View.extend({
			id: 'com.ebt.editGroup_grouplist',
			events:{
				'click .del':'del',
				'click .time': 'return',
				'click .addBatch':"addBatch",
				'click .sub_list li': "chooseAsideMenu",
				'click .choosePlace li': "choosePlaceMenu",
				'click .startLession': "startLession",
				'click .completeGroup': "completeGroup",
				'click .addGroup': "addGroup",
				'click .addBatchList': "addBatchList",
				'click .searchStudent': "searchStudentOrTeach",
				'click .searchTeach': "searchStudentOrTeach",
				'click .trainNameList li': "trainNameList",
				'click .teachNameList li': "teachNameList",
				'click .outGroup': "outGroup",
				'click .outStudent': "outStudent",
				"click .trainDateInputStart": "chooseStartTime",
				"click .trainDateInputEnd": "chooseEndTime",
				"click": "clickPage",
				"click .editGroup": "editGroup",
				"click .changeStudent": "changeStudent",
				"click .delTeacher": "delTeacher",
				"click .changeGroup": "changeGroup",
				"click .addRemark": "addRemark",
				"click .editRemark": "editRemark",
				"click .cancelRemark": "cancelRemark",
				"click .cancelRemarkSed": "cancelRemarkSed"
			},
			return: function() {
				window.history.go(-1);
				var that = this;
				if(that.teachName.length>0){
					that.teachName =[];
				}
			},
			count2:0,
			//更新下载数据
			updateSession:function(){
				var downloadCoursesKey = Util._getCourseKey(Util.DOWNLOAD_COURSES);
				var downloadCourses = Piece.Store.loadObject(downloadCoursesKey);
				Util.Ajax(
					openApi.queryGroup,
					{
						"access_token": Piece.Session.loadObject("accessToken"),
						"courseId": Piece.Session.loadObject("courseId")
					}, null,
					function(data1, textStatus, jqXHR) {
						console.log(data1);
						downloadCourses[ Piece.Session.loadObject("courseId")].result.batchs = data1;
						Piece.Store.saveObject(downloadCoursesKey, downloadCourses);
						var lessionData = Piece.Store.loadObject(downloadCoursesKey);
						Piece.Session.saveObject("lessionData",lessionData[ Piece.Session.loadObject("courseId")]);
						console.log(Piece.Session.loadObject("lessionData"));
					},
					function(e, xhr, type) {
						console.error("---Error happens when downloadCourse---");
						console.error(e);
						//回调给html页面处理d
						if (errorCallback !== null && errorCallback !== undefined) {
							errorCallback(e, xhr, type);
							new Piece.Toast(e,5000);
							return;
						}
					},
					null,
					null,
					null,
					Util.REQUEST_TYPE,
					"json"
				);
			},
			returnAll: function() {
				var id= Piece.Session.loadObject("gId");
				var title= Piece.Session.loadObject("lessionTitle");
				var url = "batchlist?courseId="+id+"&action=group&title="+title;
				that.navigate(url, {
					trigger: true
				});
			},
			del:function(e){
				var target=$(e.currentTarget);
			},
			changeStudent: function(e) {
				$(".remark").show();
				$(".masker").show();
				$(".firstGroup").html("原组号:"+ $(e.currentTarget).attr("data-groupName"));
				$(".firstGroup").attr("data-gID",$(e.currentTarget).attr("data-value"));
			},
			changeGroup: function(e) {
				$(".remarkGroup").show();
				$(".masker").show();
				console.log($(e.currentTarget).attr("data-groupName"));
				$(".firstGroup").html("原组名:"+ $(e.currentTarget).attr("data-groupName"));
				$(".firstGroup").attr("data-gID",$(e.currentTarget).attr("data-value"));
			},
			addRemark: function() {
				var that = this;
				var count = 0;
				var groupId =0;
				console.log($(".secondValue").val());
				console.log($(".firstGroup").attr("data-gID"));
				$(".group").each(function(index,item){
					if($(".secondValue").val()==$(this).attr("data-value")){
						count +=1;
						groupId = $(this).attr("data-ID")
					}
				})
				if(count>0){
					$.ajax({
						type: "post",
						url: openApi.change+"?groupId="+groupId+"&gId="+$(".firstGroup").attr("data-gID")+
						"&access_token="+Piece.Session.loadObject("accessToken"),
						dataType: "json",
						success: function(data){
							if(data.resultCode!=0){
								new Piece.Toast(data.resultMsg,5000);
								return;
							}else{
								$(".remark").hide();
								$(".masker").hide();
								$(".secondValue").val("");
								that.updateSession();
								that.onShow();
							}
						}
					});
				}else{
					new Piece.Toast("组号不存在",3000);
				}
			},
			editRemark: function() {
				var that = this;
				if($(".secondName").val().match(/[\x01-\xFF]*/)==false){
					new Piece.Toast("填写组名不可写中文，英文和字符");
					return;
				}
			    var param={
                  groupId:$(".firstGroup").attr("data-gID"),
                  groupName:$(".secondName").val(),
				  access_token:Piece.Session.loadObject("accessToken")
			    }       
				$.ajax({
					type: 'POST',
					url: openApi.updateGroup,
					data:param,
					dataType: "json",
					success: function(data){
						if(data.resultCode!=0){
							new Piece.Toast(data.resultMsg,3000);
							return;
						}else{
							that.updateSession();
							$(".remarkGroup").hide();
							$(".masker").hide();
							$(".secondName").val("");
							that.onShow();
						}
					}
				});
			},
			cancelRemark: function() {
				$(".remark").hide();
				$(".masker").hide();
			},
			cancelRemarkSed: function() {
				$(".remarkGroup").hide();
				$(".masker").hide();
			},
			chooseStartTime:function(){
				var that = this;
				var time;
				var courseYear = $('.trainDateInputStart').text();
				cordova.exec(function(obj) {
					time = obj;
					$(".trainDateInputStart").text(time);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [2, courseYear + " 00:00"]);
			},
			chooseEndTime:function(){
				var that = this;
				var time;
				var courseYear = $('.trainDateInputEnd').text();
				cordova.exec(function(obj) {
					time = obj;
					$(".trainDateInputEnd").text(time);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [2, courseYear + " 00:00"]);
			},
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+viewTemplatecontent;

				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			lessonSeesion:"",
			rendertpl:function(){
				var template = $('#grouplist_template').html();
				
				var Title = Piece.Session.loadObject("lessionTitle")
				var trainTitle = Piece.Session.loadObject("GroupName");
				$('.title').html( Title+"("+trainTitle+")");
				//var data = Piece.Session.loadObject("batchs");
				var that = this;
				temp = location.hash.split("&")[1];
				action = !!temp ? temp.split("=")[1]:"add";
				if(action=="begin"){
					if(that.teachName.length!=0){
						that.teachName=[];
					}
					console.log(that.teachName)
					var webSite = _.template(template);
					$("#content").html(webSite);
				}else{
					var url = openApi.queryGroup;
					var param = {
						"courseId": Piece.Session.loadObject("courseId"),
						"access_token": Piece.Session.loadObject("accessToken")
					};
					$.ajax({
						type: "GET",
						url: url+"?courseId="+param.courseId+"&access_token="+param.access_token,
						dataType: "json",
						success: function(data){
							var tempData =  data;
							console.log("带上传页面缓存数据======：");
							console.log(data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")]);
							data.result[Piece.Session.loadObject("index")].batchs = data.result[Piece.Session.loadObject("index")].batchs.sort(function(x,y){
								return x.batchName - y.batchName;
							});
							if(action== "group"){
								console.log(data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")])
								if(data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")].instructors!=""&&
									data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")].instructors!=null&&
									data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")].instructors!=undefined){
									if(that.teachName.length!=0){
										that.teachName=[];
									}
									for(var i=0;i<data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")].instructors.length;i++){
										var contect = {}
										contect.dataName =data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")].instructors[i].instructorName;
										contect.dataId =data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")].instructors[i].instructorId;
										that.teachName.push(contect);
									}
									console.log(that.teachName)
								}
							}
							var webSite = _.template(template,data.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")]);
							$("#content").html(webSite);
							$(".chooseGroupLi").each(function(index,item){
								if($(this).children("span").length>6){
									$(this).css({
                                		"height":"100px",
                                	})
								}
							})
						}
					});
				}

			},
			chooseAsideMenu: function(e) {
			
				var that = this,
					$target = $(e.currentTarget);
				// 修改菜单栏样式
				$target.removeClass("chooseGroupLi");
				$target.addClass("sub_active").siblings().removeClass("sub_active");
				$target.siblings().addClass("chooseGroupLi");
				batch =$target.attr("data-value");
				console.log(JSON.parse(batch));
				//保存当前选中批次学生
				Piece.Session.saveObject("batch",JSON.parse(batch));
			},
			addGroup:function(){
				var that=this;
				var param={};
				param.batchId = Piece.Session.loadObject("batchId");
				param.GroupsCountValue = $(".GroupsCountValue").val();
				if(param.GroupsCountValue == ""||param.GroupsCountValue == null||$(".GroupsStudentValue").val()==null||$(".GroupsStudentValue").val()==""){
					new Piece.Toast("请填写组名或学生名字");
					return;
				}
				if($(".GroupsCountValue").val().length>4){
					new Piece.Toast("填写组名不可大于4个字");
					return;
				}
				if($(".GroupsCountValue").val().match(/[\x01-\xFF]*/)==false){
					new Piece.Toast("填写组名不可写中文");
					return;
				}
				$(".group").each(function(index,item){
					var count = $(".GroupsCountValue").val()
					var count1 = $(item).attr("data-value")
					var count2 = 0
					if(count==count1){
						if($(this).parent().children(".studentsItem").length>=10){
							that.count2 = that.count2+ 1;
						}
					}
				})
				if(that.count2!=0){
					new Piece.Toast("组员最多10个，不可再添加");
					that.count2=0
					return;
				}
					if($(".group").length==0){
						$.ajax({
							type: "POST",
							url: openApi.newGroup+"?batchId="+param.batchId+"&groupName="+param.GroupsCountValue+"&access_token="+Piece.Session.loadObject("accessToken"),
							dataType: "json",
							success: function(data){
								console.log(data)
								if(data.resultCode!=0){
									new Piece.Toast(data.resultMsg);
									return;
								}else{
									var newparam={
										groupId:data.result.groupId,
										studentId:$(".GroupsStudentValue").attr("data-value"),
										access_token:Piece.Session.loadObject("accessToken")
									}
									$.ajax({
										type: "POST",
										url: openApi.newStudent,
										data:newparam,
										dataType: "json",
										success: function(data1){
											console.log(data1);
											if(data1.resultCode!=0){
												new Piece.Toast(data1.resultMsg,5000);
												var removeGroupparam={
                                                 groupId:data.result.groupId,
												 access_token:Piece.Session.loadObject("accessToken")
												}
												$.ajax({
													type: "POST",
													url: openApi.removeGroup,
													data:removeGroupparam,
													dataType: "json",
													success: function(data){
														console.log(data);
														if(data.resultCode!=0){
															Piece.Toast(data.resultMsg);
															return;
														}else{
															that.updateSession();
															that.onShow();
														}
													}
												});
											}else{
												that.onShow();
											}
										}
									});
								}
							}
						});
					}else{
						$(".group").each(function(index,item){
							if($(".GroupsCountValue").val()==$(this).attr("data-value")){
								var groupId = $(this).attr("data-ID");
								$.ajax({
									type: "POST",
									url: openApi.newStudent+"?groupId="+groupId+"&studentId="+$(".GroupsStudentValue").attr("data-value")+
									"&access_token="+Piece.Session.loadObject("accessToken"),
									dataType: "json",
									success: function(data2){
										console.log(data2);
										if(data2.resultCode!=0){
											Piece.Toast(data2.resultMsg);
										}else{
											that.updateSession();
											that.onShow();
										}
									}
								});
								return false;
							}else{
								var newGroupdata={
                                   batchId:param.batchId,
                                   groupName:param.GroupsCountValue,
                                   access_token:Piece.Session.loadObject("accessToken")
								}
								$.ajax({
									type: "POST",
									url: openApi.newGroup,
									data:newGroupdata,
									dataType: "json",
									success: function(data){
										//console.log(data)
										if(data.resultCode!=0){
											//Piece.Toast(data.resultMsg);
										}else{
											$.ajax({
												type: "POST",
												url: openApi.newStudent+"?groupId="+data.result.groupId+"&studentId="+$(".GroupsStudentValue").attr("data-value")+
												"&access_token="+Piece.Session.loadObject("accessToken"),
												dataType: "json",
												success: function(data1){
													console.log(data1);
													if(data1.resultCode!=0){
														Piece.Toast(data1.resultMsg);
														$.ajax({
															type: "POST",
															url: openApi.removeGroup+"?groupId="+data.result.groupId+
															"&access_token="+Piece.Session.loadObject("accessToken"),
															dataType: "json",
															success: function(data){
																console.log(data);
																if(data.resultCode!=0){
																	Piece.Toast(data.resultMsg);
																}else{
																	that.updateSession();
																	that.onShow();
																}
															}
														});
													}else{
														that.onShow();
													}
												}
											});
										}
									}
								});

							}
						});
					}
				
			},
			trainNameList: function(e) {
				var $el = $(e.currentTarget);
				$(".GroupsStudentValue").val($el.attr("data-name") + "(" + $el.attr("data-id") + ") ").attr("data-value", $el.attr("data-id") );
				$(".trainNameList li").removeClass("selected");
				$el.addClass("selected");
			},
			teachNameList: function(e) {
				var that = this;
				var $el = $(e.currentTarget);
				var content = {};
				var str = "";
				var id ="";
				content.dataId = $el.attr("data-id");
				content.dataName = $el.attr("data-name");

				if(that.teachName.length>0){
					for(var i=0;i<that.teachName.length;i++) {
						if (content.dataId == that.teachName[i].dataId) {
							Piece.Toast("不许再添加已选择的教员");
							$(".GroupsTeachValue").val("");
							return;
						}
					}
				}
				that.teachName.push(content);
				for(var i=0;i<that.teachName.length;i++){
					str +="<div class='teachName'>"+that.teachName[i].dataName+"<img data-Id="+that.teachName[i].dataId+ " class='delTeacher' src='../base/img/u3341.png'>"+"</div>";
					id +=that.teachName[i].dataId+",";
				}
				console.log(str)
				$(".Teacher").html(str);
				$(".TeacherId").html(id);
				//$(".GroupsTeachValue").val(that.teachName+$el.attr("data-name") + "(" + $el.attr("data-id") + "), ").attr("data-value", $el.attr("data-id") );
				$(".teachNameList li").removeClass("selected");
				$el.addClass("selected");
				//that.teachName=$(".GroupsTeachValue").val();
				//that.teachName.push($(".GroupsTeachValue").val());
				$(".GroupsTeachValue").val("")
				console.log($(".TeacherId").html().substring(0,$(".TeacherId").html().length-1))
				console.log($(".teachName").length)
			},
			clickPage: function(e) {
				var el = e.target;
				//隐藏带飞教员的搜索结果
				$(".trainNameList").hide();
				$(".teachNameList").hide();
			},
			//teachName : "",
			teachName : [],
			splitCount : 0,
			//删除多教员
			delTeacher:function(e){
				var that = this;
				var Id =$(e.currentTarget).attr("data-Id");
				var str = "";
				var id ="";
				console.log(that.teachName)
			
				for(var i=0;i<that.teachName.length;i++){
					if(Id==that.teachName[i].dataId){
						that.teachName.splice(i,1);
					}
				}
				for(var i=0;i<that.teachName.length;i++){
					str +="<div class='teachName'>"+that.teachName[i].dataName+"<img data-Id="+that.teachName[i].dataId+ " class='delTeacher' src='../base/img/u3341.png'>"+"</div>";
					id +=that.teachName[i].dataId+",";
				}
				$(".Teacher").html(str);
				$(".TeacherId").html(id);
				console.log($(".TeacherId").html().substring(0,$(".TeacherId").html().length-1))
				console.log($(".teachName").length)

			},
			//搜索学员与教员
			searchStudentOrTeach:function(e){
				var that = this;
				
				var name = "";
				if($(e.currentTarget).attr("data-value")=="student"){
					name = $(".GroupsStudentValue").val();
					
					$(".trainNameList").hide();
				}else{
					name = $(".GroupsTeachValue").val();
					
					$(".trainNameList").hide();
				}

				if (/(^\s+)|(^$)/.test(name)) {
					Piece.Toast("用户姓名不能为空");
					return;
				} else {
				
					var quserparam={
						name:name.replace(/\(.*\)/, ""),
						companyId:Piece.Session.loadObject("companyId"),
						access_token:Piece.Session.loadObject("accessToken")
					}
					$.ajax({
						type: "POST",
						url: openApi.query_users,
						data:quserparam,
						dataType: "json",
						success: function(data){
							console.log(data);
							if(data.resultCode!=1){
								if (data.result.length > 0) {
									var str = "";
									var r = data.result;
									for (var i = 0; i < r.length; i++) {
										str += "<li data-name='" + r[i].accountName + "' data-id='" + r[i].accountId + "'";
										if (i === 0) {
											str += "class='selected'";
										}
										str += ">" + r[i].accountName + "(" + r[i].accountId + ") " + r[i].companyName + r[i].deptName + "</li>";
									}

									if($(e.currentTarget).attr("data-value")=="student"){
										$(".GroupsStudentValue").val(r[0].accountName + "(" + r[0].accountId + ") ").attr("data-value", r[0].accountId);
										$(".trainNameList ul").html(str);
										$(".trainNameList").show();
									}else{
										
										$(".GroupsTeachValue").val(r[0].accountName + "(" + r[0].accountId + ") ").attr("data-value", r[0].accountId);
									
										$(".teachNameList ul").html(str);
										$(".teachNameList").show();
										

									}

								} else {
									Piece.Toast("找不到此成员");
								}
							}else{
								Piece.Toast(data.resultMsg);
							}

						}
					});
				}
			},
			//删除分组
			outGroup:function(e){
				var that=this,
					$target = $(e.currentTarget);
				$.ajax({
					type: "POST",
					url: openApi.removeGroup+"?groupId="+$target.attr("data-value")+
					"&access_token="+Piece.Session.loadObject("accessToken"),
					dataType: "json",
					success: function(data){
						console.log(data);
						if(data.resultCode!=0){
							Piece.Toast(data.resultMsg);
							return;
						}else{
							that.updateSession();
							that.onShow();
						}
					}

				});


			},
			//删除学生
			outStudent:function(e){
				var that=this,
					$target = $(e.currentTarget);
				console.log($target.parent());
				$.ajax({
					type: "POST",
					url: openApi.removeStudent+"?gId="+$target.attr("data-value")+
					"&access_token="+Piece.Session.loadObject("accessToken"),
					dataType: "json",
					success: function(data){
						console.log(data);
						if(data.resultCode!=0){
							new Piece.Toast(data.resultMsg);
							return;
						}else{
							that.updateSession();
							if($target.parent().parent().children().length == 2){
								$.ajax({
									type: "POST",
									url: openApi.removeGroup+"?groupId="+$target.attr("data-group")+
									"&access_token="+Piece.Session.loadObject("accessToken"),
									dataType: "json",
									success: function(data){
										console.log(data);
										if(data.resultCode!=0){
											Piece.Toast(data.resultMsg);
											return;
										}
										that.updateSession();
									}
								});
								that.onShow();
							}else{
								that.onShow();
							}
						}
					}

				});


			},
			choosePlaceMenu: function(e) {
				
				var that = this,
					$target = $(e.currentTarget);
				// 修改菜单栏样式
				$target.removeClass("choosePlaceLi");
				$target.addClass("roleGrolItem").siblings().removeClass("roleGrolItem");
				$target.siblings().addClass("choosePlaceLi");
			},
			startLession: function() {
				try{
					var that=this;
					//保存组Id
					var groupId =$(".sub_active").attr("data-groups");
					Piece.Session.saveObject("groupId",groupId);
					//保存当前选中批次学生
					batch =$(".sub_active").attr("data-value");
					console.log(JSON.parse(batch));
					Piece.Session.saveObject("batch",JSON.parse(batch));
					//保存地点Id
					var placeId = $(".roleGrolItem").attr("data-value");
					var placeName = $(".roleGrolItem").text();
					if(placeId !=undefined){
						Piece.Session.saveObject("placeId",placeId);
						Piece.Session.saveObject("placeName",placeName);
					}else{
						new Piece.Toast("请选择地点和分组", 3000);
						return;
					}
					var url = "../com.ebt.course/chooseSkill";
					that.navigate(url, {
						trigger: true
					});

				}catch(e) {
					new Piece.Toast("请选择地点和分组", 3000);
				}

			},
			completeGroup: function() {
				var that=this;

				if($(".batchName").val()==""){
					new Piece.Toast("请填写批次名字");
					return;
				}
				if (new Date($(".trainDateInputStart").html()).formatDate("yyyy-MM-dd") < new Date().formatDate("yyyy-MM-dd")) {
						console.log("开始时间设置错误");
						new Piece.Toast("开始时间设置不可小于当前时间");
						return;
				}

				if(new Date($(".trainDateInputEnd").html()).formatDate("yyyy-MM-dd")<new Date().formatDate("yyyy-MM-dd")){
					console.log("结束时间设置错误");
					new Piece.Toast("结束时间设置不可小于当前时间");
					return;
				}
								//if($(".teachName").length==0){
				//	console.log("请填写教员名字");
				//	new Piece.Toast("请填写教员名字");
				//	return;
				//}
				if($(".teachName").length==0||!$(".teachName").length){
					window.history.back();
				}else{
					var date = Piece.Session.loadObject("sessionDate");
					console.log(date)
					console.log(Piece.Session.loadObject("GroupName"))
					var Count =0;
					for(var i=0;i<date.result.length;i++){
						if(date.result[i].trainName==Piece.Session.loadObject("GroupName")){
							console.log(date.result[i])
							for(var j=0;j<date.result[i].batchs.length;j++){
								if(that.dateCross(new Date($(".trainDateInputEnd").html()).formatDate("yyyy-MM-dd"),
										new Date($(".trainDateInputStart").html()).formatDate("yyyy-MM-dd"),
										new Date(date.result[i].batchs[j].startTime).formatDate("yyyy-MM-dd"),
										new Date(date.result[i].batchs[j].endTime).formatDate("yyyy-MM-dd"))==="false")
								{
									Count = Count+1;
								}
							}
						}
					}
					var result = Piece.Session.loadObject("batchs");
					var updatadata={
							batchId:result.batchId,
							batchName:$(".batchName").val(),
							startTime:$(".trainDateInputStart").html(),
							endTime:$(".trainDateInputEnd").html(),
							instructors:$(".TeacherId").html().substring(0,$(".TeacherId").html().length-1),
							access_token:Piece.Session.loadObject("accessToken")
						}
					if(Count>0){
						var a =window.confirm("此批次的开始日期和结束日期前与已有批次日期有交叉")
						
						if(a){
						
							$.ajax({
								type: "POST",
								url: openApi.updateBatch,
								data:updatadata,
								dataType: "json",
								success: function(data){
									console.log(data);
									if(data.resultCode!=0){
										new Piece.Toast(data.resultMsg);
										return;
									}else{
										that.updateSession();
										window.history.back();
									}
								}
							});
						}else{
							return;
						}
					}else{
					
						$.ajax({
							type: "POST",
							url: openApi.updateBatch,
							data:updatadata,
							dataType: "json",
							success: function(data){
								console.log(data);
								if(data.resultCode!=0){
									new Piece.Toast(data.resultMsg);
									return;
								}else{
									that.updateSession();
									window.history.back();
								}
							}
						});
					}

				}


			},
			//判断日期是否交叉
			dateCross:function(begin1,end1,begin2,end2){
				var begin1Time=new Date(begin1).getTime();
				var end1Time=new Date(end1).getTime();
				var begin2Time=new Date(begin2).getTime();
				var end2Time=new Date(end2).getTime();
				if(begin1Time>begin2Time && begin1Time<end2Time|| end1Time >begin2Time && end1Time <end2Time)
					{
					console.log("false");
					return "false";
					}

			},
			addBatchList:function(){
				var that=this;
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE != networkState) {
					//console.log($(".GroupsTeachValue").val().substring(0,$(".GroupsTeachValue").val().length-1).substring().indexOf("("));
					//console.log($(".GroupsTeachValue").val().substring(0,$(".GroupsTeachValue").val().length-1).substring().indexOf(")"));
					//console.log($(".GroupsTeachValue").val().substring(0,$(".GroupsTeachValue").val().length-1).substring($(".GroupsTeachValue").val().substring(0,$(".GroupsTeachValue").val().length-1).substring().indexOf("(")+1,$(".GroupsTeachValue").val().substring(0,$(".GroupsTeachValue").val().length-1).substring().indexOf(")")));
					if ($(".batchName").val() == "") {
						new Piece.Toast("请填写批次名字");
						return;
					}
					if ($(".trainDateInputStart").html() == "" || $(".trainDateInputStart").html() == null) {
						new Piece.Toast("请写开始时间");
						return;
					}
					if ($(".trainDateInputEnd").html() == "" || $(".trainDateInputEnd").html() == null) {
						new Piece.Toast("请写结束时间");
						return;
					}
					if (new Date($(".trainDateInputStart").html()).formatDate("yyyy-MM-dd") < new Date().formatDate("yyyy-MM-dd")) {
						console.log("开始时间设置错误");
						new Piece.Toast("开始时间设置不可小于当前时间");
						return;
					}
					if (new Date($(".trainDateInputEnd").html()).formatDate("yyyy-MM-dd") < new Date().formatDate("yyyy-MM-dd")) {
						console.log("结束时间设置错误");
						new Piece.Toast("结束时间设置不可小于当前时间");
						return;
					}

					if ($(".teachName").length == 0 || !$(".teachName").length) {
						console.log("请填写教员名字");
						new Piece.Toast("请填写教员名字");
						return;
					} else {
						var date = Piece.Session.loadObject("sessionDate");
						console.log(date)
						console.log(Piece.Session.loadObject("GroupName"))
						var Count = 0;
						for (var i = 0; i < date.result.length; i++) {
							if (date.result[i].trainName == Piece.Session.loadObject("GroupName")) {
								console.log(date.result[i])
								for (var j = 0; j < date.result[i].batchs.length; j++) {
									if (that.dateCross(new Date($(".trainDateInputEnd").html()).formatDate("yyyy-MM-dd"),
											new Date($(".trainDateInputStart").html()).formatDate("yyyy-MM-dd"),
											new Date(date.result[i].batchs[j].startTime).formatDate("yyyy-MM-dd"),
											new Date(date.result[i].batchs[j].endTime).formatDate("yyyy-MM-dd")) === "false") {
										Count = Count + 1;
									}
								}
							}
						}
						var param={
							trainId:Piece.Session.loadObject("trainId"),
							batchName:$(".batchName").val(),
							startTime:$(".trainDateInputStart").html(),
							endTime:$(".trainDateInputEnd").html(),
							instructors:$(".TeacherId").html().substring(0, $(".TeacherId").html().length - 1),
							access_token:Piece.Session.loadObject("accessToken")
				             
							}

							
						if (Count > 0) {
							var a = window.confirm("此批次的开始日期和结束日期前与已有批次日期有交叉")
							if (a) {
								
								$.ajax({
									type: "POST",
									url: openApi.newBatch, 
									data:param,
									dataType: "json",
									success: function (data) {
										console.log(data);
										if (data.resultCode != 0) {
											new Piece.Toast(data.resultMsg);
											return;
										} else {
											Piece.Toast("添加成功", 5000);
											that.updateSession();
											window.history.go(-1)
										}
									}
								});
							} else {
								return;
							}
						} else {
							
							$.ajax({
								type: "POST",
								url: openApi.newBatch,
								data:param,
								dataType: "json",
								success: function (data) {
									console.log(data);
									if (data.resultCode != 0) {
										new Piece.Toast(data.resultMsg);
										return;
									} else {
										Piece.Toast("添加成功", 5000);
										that.updateSession();
										window.history.go(-1)
									}
								}
							});
						}
					}
				}else{
					Piece.Toast("当前网络无连接，请网络成功后继续操作", 5000);
				}
			},
			editGroup: function() {
				var that=this;
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					new Piece.Toast(baseLocale.network_not_available);
				}else{
					var batchId = Util.request("batchId");
					var trainName = Util.request("trainName");
					var url = "../com.ebt.editGroup/grouplist?batchId="+batchId+"&action=group"+"&trainName="+trainName;
					that.navigate(url, {
						trigger: true
					});
				}


			},
			onShow: function() {
				var that=this;
				temp = location.hash.split("&")[1];
				action = !!temp ? temp.split("=")[1] : "begin";
				var networkState = navigator.network.connection.type || navigator.connection.type;
					if (Connection.NONE === networkState) {
					//new Piece.Toast(baseLocale.network_not_available);
					var template = $('#grouplist_template').html();
					var Title = Piece.Session.loadObject("lessionTitle")
					var trainTitle = Piece.Session.loadObject("GroupName");
					$('.title').html( Title+"("+trainTitle+")");
					var data = Piece.Session.loadObject("lessionData");
					console.log(data)
					data.result.batchs.result[Piece.Session.loadObject("index")].batchs = data.result.batchs.result[Piece.Session.loadObject("index")].batchs.sort(function(x,y){
						return x.batchName - y.batchName;
					});
						var webSite = _.template(template,data.result.batchs.result[Piece.Session.loadObject("index")].batchs[Piece.Session.loadObject("batchIndex")]);
						$("#content").html(webSite);
					} else {
						if(action=="group"){
							that.rendertpl();
							console.log(that.teachName);
						}else if(action=="start"){
							that.rendertpl();
						}else if(action=="begin"){
							that.rendertpl();
						}
					}

				//write your business logic here :)
			}
		}); //view define

	});