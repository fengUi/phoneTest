define(['text!com.ebt.course/allCourse.html', "text!com.ebt.course/template/allCourse_template.html", "text!com.ebt.course/template/allCoursetip_template.html", "text!com.ebt.course/template/menuList_template.html", '../base/openapi', '../base/util', "i18n!../com.ebt.course/nls/menu", "i18n!../base/nls/messageResource", "i18n!com.ebt.course/nls/courseall"],
	function(viewTemplate, templateContent, tiptemplate, menuListTemp, OpenAPI, Util, Menu, baseLocale, Locale,date) {
		return Piece.View.extend({
			id: 'com.ebt.course_allCourse',
			events: {
				"click": "elClick",
			
				"click .course_item": "clickItem",
				"click .edit": "edit_item",
				"click .del_item": "del_item_click",
				
				"showTip .course_item": "showDetail",
				"click .course_btn": "closeDetail",
				"click .search": "showdialog",
				"click .cancelBtn": "closedialog",
				"click .bookmarks": "showOrHideMenu",
				"click .menuItem": "navigation",
				"click .confirmBtn": "queryCourse",
				"click .refresh": "refresh",
				"click #chooseCourseTime": "chooseCourseTime",
				"click .skilledLevelItem": "chooseSkilledLevel",
				"click #menuMasker": "hideMenuAndMasker",
				"click .close":"closedialog"
				
			},
			lessionBatchArraay:[],
            //课程分组
            coursegroup:function(id){
            	
            	
            	var that=this;
                 var url="com.ebt.editGroup/batchlist?courseId="+id+"&action=group";
                 that.navigateModule(url,{trigger:true});


            },
            			// 把事件绑定到el上面，如果当前没有点击到别的东西就隐藏删除按钮的遮罩层
			elClick:function(e){
				var $tar=$(e.target);
				var className=$tar[0].className;
				if(className!=="course_item_masker"&&className!=="del_item"){
					$(".course_item_masker").hide();
				}
			},
		
			myScroll: null,
			chooseSkilledLevel: function(e) {
				$("#skilledLevel .skilledLevelItem").removeClass('skilledLevelActive');
				var $target = $(e.currentTarget);
				$target.addClass('skilledLevelActive');
			},
			edit_item: function(e) {
				var that = this,
					$tar = $(e.currentTarget);
				// $tar.toggleClass("active");
				$(".course_item_masker").show();
			},
			del_item_click: function(e) {
				var that=this;
				var $course_item = $(e.currentTarget).parents(".course_item"),
					$course_year = $course_item.parent(),
					course_itemLen = $course_year.find(".course_item").length,
					courseId = $course_item.attr("data-value"),
					yearId = $course_year.find(".timeline").text();
				// 首先判断当前课程是否有未完成或者待上传的数据
				var checkResult = this.checkIfHasCompeleteLessons(courseId);
				// 如果有数据则提示不能删除否则删除当前标签并且删除缓存中的数据
				if (!checkResult) {
					new Piece.Toast(Locale.no_delCourse);
				} else {
					// 如果当前年份只有一个课程则删除整年数据，否则删除点钱课程
					if (course_itemLen > 1) {
						// 点击删除时候删除当前节点以及缓存中对应的数据
						$course_item.remove();
						that.delLocaleCourseinfo("course",yearId, courseId);
					} else {
						$course_year.remove();
						that.delLocaleCourseinfo("year", yearId);
					}

				}
			},
			checkIfHasCompeleteLessons: function(courseId) {
				// 如果是从上传页面进来的也要对待完成页面进行验证
				var toUploadCourseData = Util.getLessonsFromCacheByType(Util.CACHE_TYPE_PEND);
				var tofinishCourseData = Util.getLessonsFromCacheByType(Util.CACHE_TYPE_UNFI);
				var toUploadCourseArr = [],
					toFinishCourseArr = [],
					courseArr = [];
				if (!Util.isNull(toUploadCourseData)) {
					toUploadCourseArr = _.keys(toUploadCourseData);
					// 获取courseId数组，判断是否已经有人上过这个课了
					_.each(toUploadCourseArr, function(item, index) {
						var item_courseId = item.split("_")[0];
						courseArr.push(item_courseId);
					});
				}
				if (!Util.isNull(tofinishCourseData)) {
					toFinishCourseArr = _.keys(tofinishCourseData);
					_.each(toFinishCourseArr, function(item, index) {
						var item_courseId = item.split("_")[0];
						courseArr.push(item_courseId);
					});
				}
				if (courseArr.length > 0) {
					if (_.contains(courseArr, courseId)) {
						return false;
					}
				}
				return true;
			},
			delLocaleCourseinfo: function(type, yearId, courseId) {
				// 删掉课时列表中的信息
				Util.delCourseListData(type, yearId, courseId);
				// 删除本地下载的数据
				Util.delDownloadCourse(courseId);
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
			refresh: function() {
				var that = this;
				 Util.clearWarn(document.body);
				$(".title").html(Locale.allcourse);
				
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					/*var data = Piece.Store.loadObject(courseListKey);
					if (!Util.isNull(data)) {
						that.renderCourseListTemp(data);
					} else {
						new Piece.Toast(baseLocale.system_error);
						return;
					}*/
					new Piece.Toast("网络连接失败");
				} else {
					that.checkDown();
				}
			},
			//检测下载状态
			checkDown:function(){
				var that=this;
                 var downloadStatusArrKey = Util._getCourseKey(Util.DOWNLOAD_STATUS_ARR);
			     var downloadStatusArr = Piece.Store.loadObject(downloadStatusArrKey) || [];
			     var courseListKey = Util._getCourseKey(Util.CACHE_COURSE_LIST);
				 console.log(courseListKey);
			     var index=[];
			     var count=0;
			     Util.CourseIdList(function(data, textStatus, jqXHR){
			     	 console.log(data);

			     	 for(var i=0;i<downloadStatusArr.length;i++){
			     	 	if(data.indexOf(downloadStatusArr[i])==-1){
                            index.push(i);
                            new Piece.Toast("下载的课程已失效")
			     	 	}
			     	 };
			     	 for(var j=0;j<index.length;j++){
			     	 	downloadStatusArr.splice(index[j]-count,1);
			     	 	count++;
			     	 }
			     	 Piece.Store.saveObject(downloadStatusArrKey,downloadStatusArr)
                     Util.requestCourseList(function() {

						var data = Piece.Store.loadObject(courseListKey);
						
						if (!Util.isNull(data)) {
							that.renderCourseListTemp(data);
						} else {
							new Piece.Toast(baseLocale.request_fail);
						}
					}, function() {
						new Piece.Toast(baseLocale.request_fail);
					});

			     },function(){

			     })
			},
			//查询课程
			queryCourse: function() {
                Util.clearWarn(document.body);
				var that = this;
				var courseYear = $("#courseYear").html();
				
				var courseYearperiod = $("#courseYearperiod").html();
				
				var courseName = $("#courseName").val();
				
				/*var skilledLevel = $("#skilledLevel").val();

				if (skilledLevel === Locale.all) {
					skilledLevel = "";
				}*/
				that.closedialog();
				var requestData_queryCourse = {
					"year": courseYear.substr(0, 4),
					
					"courseYearperiod": courseYearperiod,
					"courseName": courseName,
					//"skilledLevel": skilledLevel
				};
				
				var data = Util.queryCourse2(requestData_queryCourse);
				
				$(".title").html(Locale.searchResult);
				  that.renderCourseListTemp(data);
				if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
					
				}else{
					
				     Util.ResultWarn(document.body, Locale.nosearchResult);
					
				}
				
				
			},
			navigation: function(e) {
				var that = this,
					$target = $(e.currentTarget);
				moduleValue = $target.attr("data-value");
				var url = moduleValue;
				that.navigateModule(url, {
					trigger: true
				});
			},
			showOrHideMenu: function() {
				$("#menuMasker").toggle();
				$(".menu").toggle();
			},
			hideMenuAndMasker: function() {
				$("#menuMasker").toggle();
				$(".menu").toggle();
			},
			clickItem: function(e) {
				var that = this;
				var $target = $(e.target);
				var curClass = $target.attr("class");
				var $curtarget = $(e.currentTarget);
				
				// 如果点击到了遮罩层，由别的事件代理
				
				if (curClass === "course_item_masker" || curClass === "del_item"||curClass === "courseGroup") {

					return;
				}
				// 如果点击到了下面的小图，显示课程详情
				if (curClass === "tipPic") {
					var imgId = $target.attr("data-value");
					
					//$curtarget.trigger("showTip");
					//--实例课程详情scroller
					var cId = imgId;
					//实例课程详情scroller--
					var top = $curtarget[0].offsetTop + that.myScroll.y + 79 + "px";
					var left = $curtarget[0].offsetLeft + 2 + "px";
					var width = $curtarget[0].offsetWidth - 2 + "px";
					var height = $curtarget[0].offsetHeight + "px";
					var H = $curtarget[0].offsetTop + that.myScroll.y;
					//sqhom on 20140819 bug fix
					if (H >= -4 && H < 334.72) {
						this.showDetail(imgId, top, left, width, height);
						//console.error($curtarget[0].offsetTop+that.myScroll.y);
						//console.error($curtarget[0].offsetTop+that.myScroll.y);
					} else {
						//this.showDetail(imgId,top,left,width,height);
						//console.error(that.myScroll.y);
						if (H <= 0) {
							that.myScroll.scrollToElement($curtarget[0]);
							this.showDetail(imgId, "75px", left, width, height);
						} else {
							var courseYearId = $($curtarget[0]).parent().attr("id");
							var len = $("#" + courseYearId + " .course_item").length;
							that.myScroll.scrollToElement($curtarget[0]);
							if (len % 2 == 0) {
								if ($($curtarget[0]).index() > (len - 2)) {
									this.showDetail(imgId, "397px", left, width, height);
								} else {
									this.showDetail(imgId, "82px", left, width, height);
								}
							} else {
								if ($($curtarget[0]).index() > (len - 1)) {
									this.showDetail(imgId, "397px", left, width, height);
								} else {
									this.showDetail(imgId, "82px", left, width, height);
								}
							}


						}
						//console.error($curtarget[0].offsetTop+that.myScroll.y);
					}
					var courseDetailScroller = new iScroll('wrapper' + cId, {
						hScroll: false,
					});
				} else if (curClass === "download") {
					var courseId = $curtarget.attr("data-value");
					if (!Util.checkConnection()) {
						return;
					} else {
						that.checkCourse(courseId);
					
					}
				} else if(curClass.indexOf("courseGroup")!=-1){
				
					
					var flag=$target.attr("data-status");
					if(flag=="unf"){
                         new Piece.Toast(baseLocale.download_course_tip);
                         return;
					}else{
						 var gid=$(e.currentTarget).attr("data-value");
						 Piece.Session.saveObject("gId",$(e.currentTarget).attr("data-value"));
						 Piece.Session.saveObject("lessionTitle",$(e.currentTarget).attr("data-title"));
                         this.coursegroup(gid);
					}
				}else {
					//否则进入课程
					var id = $curtarget.attr("data-value");
					if ($(".courseItem" + id + " .downloadCourse div").hasClass("already")) {
						var downloadCoursesKey = Util._getCourseKey(Util.DOWNLOAD_COURSES);
						// Piece.Store.deleteObject(downloadCoursesKey);
						var lessionData = Piece.Store.loadObject(downloadCoursesKey);
						
						if(id==lessionData[id].result.courseId){
							//没接口用测试数据
							Piece.Session.saveObject("lessionData",lessionData[id]);
							// Piece.Session.saveObject("lessionData",test);

							Piece.Session.saveObject("lessionTitle",$(e.currentTarget).attr("data-title"));
							this.gocourse(id);
						}
					} else {
						new Piece.Toast(baseLocale.download_course_tip);
					}
				}
			},
			gocourse: function(id) {
				var that = this;
				//增加登录时网络检测处理s
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					var dialog=new Piece.Dialog(
						{
							"autoshow":false,
							"target":"body",
							"content":"当前网络无连接或异常，是否离线打分?"
						},{
							"configs":[{"title":"确认",
								"eventName":"ok",
							},{"title":"取消",
								"eventName":"cancel",
							}],
							"ok":function(){
								   var url="com.ebt.editGroup/batchlist?courseId="+id;
                                   that.navigateModule(url,{trigger:true});

								
							},
							"cancel":function(){
								return;
							}
						});
					dialog.show();
				}else{

					   var url="com.ebt.editGroup/batchlist?courseId="+id;
                       that.navigateModule(url,{trigger:true});

				}

			},
			showDetail: function(imgId, top, left, width, height) {
				courseDetailId = imgId;
				$(".courseTip" + "#courseDetail" + courseDetailId).css({
					"top": top,
					"left": left,
					"width": width,
					"height": height + " !important"
				})
				$(".courseTip" + "#courseDetail" + courseDetailId).show();
				//console.log($(".courseTip"+"#courseDetail"+courseDetailId));
				$(".masker").show();
			},
			closeDetail: function() {
				$(".courseTip" + "#courseDetail" + courseDetailId).hide();
				$(".masker").hide();
			},
			showdialog: function(e) {
				$(".searchDailog").show();
				$(".masker").show();
			},
			closedialog: function() {
				$(".searchDailog").hide();
				$(".masker").hide();
			},
			renderCourseListTemp: function(data) {
				console.log("template");
				var that = this;
				var template = me.find("#allCourse_template").html();
				var tiptemplate = me.find("#allCoursetip_template").html();
				$("#scroller").html("");
				$(".courseTipList").html("");
				if (data) {
					data.lang = Locale;
					var websiteHtml = _.template(template, data);
					var tipwebsiteHtml = _.template(tiptemplate, data);
					$("#scroller").append(websiteHtml);
					$(".courseTipList").append(tipwebsiteHtml);
				}
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});
				}
				var role=Piece.Session.loadObject(Util.ROLES);
				
				if(role.indexOf("EBT-CAB-INSTRUCTOR-APP")==-1){
                   $(".courseGroup").hide();
				}
			},
			renderMenuListTemp: function(data) {

				console.log(data);
				var template = me.find("#menuList_template").html();
				var websiteHtml = _.template(template, data);
				//$(".menu").html("");
				$(".menu").append(websiteHtml);
			},
			render: function() {
				//添加模板
				me = $(this.el);
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				viewT = templateContent + viewT + menuListTemp + tiptemplate;
				me.html(viewT);
				
				Piece.View.prototype.render.call(this);
				
				return this;
			},
			redPointTip: function() {
				//待上传
				var waitUpload = Util.getLessonsFromCacheByType(Util.CACHE_TYPE_PEND);
				
				if (!Util.isNull(waitUpload)) {
					var waitUploadCounter = _.keys(waitUpload).length;
				}
				//待完成
				var waitCompletion = Util.getLessonsFromCacheByType(Util.CACHE_TYPE_UNFI);
				if (!Util.isNull(waitCompletion)) {
					var waitCompletionCounter = _.keys(waitCompletion).length;
				}
				if (waitUploadCounter > 0 || waitCompletionCounter > 0) {
					$(".bookmarksCounter").show();
				}
				if (waitUploadCounter > 0) {
					$(".waitUploadCounter").show();
					$(".waitUploadCounter").html(waitUploadCounter);
				}
				if (waitCompletionCounter > 0) {
					$(".waitCompletionCounter").show();
					$(".waitCompletionCounter").html(waitCompletionCounter);
				}
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
			onShow: function() {console.log(Menu);
				
				var that = this;
			    var courseListKey = Util._getCourseKey(Util.CACHE_COURSE_LIST);
				var data = Piece.Store.loadObject(courseListKey);
                 console.log(data);

				var downloadCoursesKey = Util._getCourseKey(Util.DOWNLOAD_COURSES);
				var downloadStatusArrKey = Util._getCourseKey(Util.DOWNLOAD_STATUS_ARR);
				console.log(Piece.Store.loadObject(downloadCoursesKey));
				console.log(Piece.Store.loadObject(downloadStatusArrKey));
				// Piece.Store.deleteObject(downloadStatusArrKey)
				// Piece.Store.deleteObject(downloadCoursesKey)
				if (!Util.isNull(data)) {
					that.renderCourseListTemp(data);
				} else {
					new Piece.Toast(baseLocale.request_fail);
				}

				that.renderMenuListTemp(Menu);
				//菜单红点提示
				that.redPointTip();
				//设置默认的课程查询时间
				that.setAutoTimeForQueryCourse();
				//更新当前时间
				//
		        var menuArr = Piece.Session.loadObject('menus');
		        console.log(menuArr);
				//Piece.Store.deleteObject(downloadCoursesKey)
				//Piece.Store.deleteObject(downloadStatusArrKey)
			},
			checkCourse:function(courseId){
			 
			  Util.CourseIdList(function(data, textStatus, jqXHR){
                         
                     if(data.indexOf(courseId)==-1){
                     	     var courseListKey = Util._getCourseKey(Util.CACHE_COURSE_LIST);
                     	    
			                 var localdata = Piece.Store.loadObject(courseListKey);
			                 console.log(localdata)
			                 for(var i=0;i<localdata.result.length;i++){
			                 	for(var j=0;j<localdata.result[i].courseslist.length;j++){
			                 		if(courseId==localdata.result[i].courseslist[j].courseId){
			                 			localdata.result[i].courseslist.splice(j, 1);
			                 		}
			                 	}
			                 }
			                $(".courseItem"+courseId).remove();
			                 Piece.Store.saveObject(courseListKey,localdata);
                           new Piece.Toast("下载的课程已失效"); 
                       }else{
                       	Util.downloadCourse(courseId,
							function() {
							$(".courseItem" + courseId + "  .downloadCourse").html('<div class="already downloadTip textC fs30">已下载</div>');
							$(".courseItem" + courseId + "  .newCourse").remove();
							$(".courseItem" + courseId).find(".courseGroup").attr("data-status","com");
							var courseListKey = Util._getCourseKey(Util.CACHE_COURSE_LIST);
							console.log(Piece.Store.loadObject(courseListKey))
							// Piece.Store.deleteObject(courseListKey)
							},
							function() {
							 	new Piece.Toast(baseLocale.download_fail);
								return;
							});
                       	 
                       }

				},function(){

				});
			 
			}
			//end
			
			
		}); 

	});