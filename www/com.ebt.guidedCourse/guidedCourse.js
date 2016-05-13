define(['text!com.ebt.guidedCourse/guidedCourse.html',
		'text!com.ebt.guidedCourse/template/guidedCourse_template.html',
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource', 'i18n!../com.ebt.guidedCourse/nls/guidedCourse'],
	function(viewTemplate, guidedCourse_template, Util, openApi, baseLocale, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_guidedCourse',
			render: function() {
				var viewTemp = _.template(viewTemplate, {
					lang: Locale
				})
				$(this.el).html(viewTemp + guidedCourse_template);

				Piece.View.prototype.render.call(this);
				return this;
			},
			ActypeArr: [],
			myScroll: null,
			// paramsObj: {
			// 	cacheId: "guidedCourse_guidedCourse",
			// 	isReloadRequest: false
			// },
			events: {
				'click .course_item': 'course_item',
				'click .top-title>img': 'return2',
				'click .show': 'search',
				'click .cancelBtn': 'cancelBtn',
				"click .skilledLevelItem": "chooseSkilledLevel",
				"click .confirmBtn": "queryCourse",
				"click .bookmarks img": "refresh",
				"click .courseTime": "chooseCourseTime",
				'click .TClick':'TClickFuc',
				'click .trainingPlaceCourseTwoClick':'trainingPlaceCourseTwoClick',
				'click .trainingPlaceEdit':'trainingPlaceEdit'
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
			//刷新
			refresh: function() {
				this.onShow();
			},
			renderTemp: function(data) {
				var template = $('#guidedCourse_template').html();
				var webSite = _.template(template, data.result);
				$('#scroller').html("");
				$('#scroller').append(webSite);
				this.iScroll();
			},
			iScroll: function() {
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {});
				}
			},
			//渲染模板，添加数据
			renderCourseListTemp: function() {
				var that = this;
				$('.title').text(Locale.guidedCourse);
				var url = openApi.queryFinishedLessonsBatch;
				var param = {
					"instructorId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken")
				};
				 if(Util.checkConnection()){
					that.requestAjax(url, param);
				 }
				 else{
				 	Piece.Toast(baseLocale.network_not_available);
				 }
			},
			//请求数据
			requestAjax: function(url, param) {
				Util.clearWarn(document.body);
				var that = this;

				$.ajax({
					type: "GET",
					url: url+"?instructorId="+param.instructorId+"&access_token="+param.access_token,
					dataType: "json",
					success: function(data){
						//var Listdata = Util.getLessonsFromCacheByType4Srh(data);
						//var check = that.courseCheck(data.result);
						var tempData = {};
						tempData.Locale = Locale;
						tempData.result = data.result;
						console.log("带上传页面缓存数据======：");
						console.log(data);
						that.renderTemp(tempData);
						// that.redColor();
						// that.getTime();
						// that.eachAcType(data.result);
						//if (!check) {
						//	Util.ResultWarn(that.el, Locale.nodata);
						//}
						// 设置过滤框默认时间
						//that.setAutoTimeForQueryCourse();
					}
				});

			},
			//获取时间
			getTime: function() {
				var date = new Date();
				var courseYear = date.getFullYear() + Locale.year;
				$('#courseYear').text(courseYear);
				var courseMonth = date.getMonth() + 1;
				var courseYearperiod;
				if (courseMonth > 7) {
					courseYearperiod = Locale.secondHalfYear;
				} else {
					courseYearperiod = Locale.firstHalfYear;
				}
				$('#courseYearperiod').text(courseYearperiod);
			},
			//滑动
			iScroll: function() {
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {});
				}
			},
			//查询确定
			queryCourse: function() {
				Util.clearWarn(document.body);
				var that = this;
				var courseYear = $('#courseYear').text().substr(0, 4);
				var courseYearperiod = $('#courseYearperiod').text();
				console.log(courseYearperiod);
				var courseName = $("#courseName").val();
				
				var paramOne = {
					"instructorId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken"),
					"courseYearperiod": courseYearperiod,
					"courseYear": courseYear
				};
				if (courseYearperiod == Locale.firstHalfYear) {
					courseYearperiod = '0';
				} else {
					courseYearperiod = '1';
				}
				paramOne.courseYearperiod = courseYearperiod;

				

				if (courseName == ''||courseName == null) {
					console.log(courseName);
					paramOne.courseName = "";
				} else {
					paramOne.courseName = courseName;
				}
				console.log(paramOne);
				var url = openApi.queryFinishedLessonsBatch;

				Util.clearWarn(document.body);
				//请求后台数据
				Util.Ajax(
					url,
					paramOne,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						console.log(data);
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							data.lang = Locale;
							that.renderTemp(data);
						} else {
							$('#scroller').html('');
							Util.ResultWarn(document.body, Locale.query_no_record);
						};
						that.returndata(data);

					},
					null,
					function() {},
					null
					// ,
					// that.paramsObj
				);
				//隐藏显示框
				that.cancelBtn();
			},
			//遍历全部机型
			eachAcType:function(data){
				var $skilledLevel = $("#skilledLevel");
				$skilledLevel.html("");
				_.each(data.actype, function(item, index) {
					var $div;
					if (index == 0) {
						console.log(item)
						$div = $("<div/>", {
							text: item,
							class: "skilledLevelItem active"
						});
					} else {
						console.log(item)
						$div = $("<div/>", {
							text: item,
							class: "skilledLevelItem"
						});
					}

					$skilledLevel.append($div);
				});
			},
			//搜索结果
			returndata: function(data) {
				$(".title").html(Locale.searchResult);
			},
			//技术级别样式
			chooseSkilledLevel: function(e) {
				$("#skilledLevel .skilledLevelItem").removeClass('skilledLevelActive');
				var $target = $(e.currentTarget);
				$target.addClass('skilledLevelActive');
				$("#skilledLevel").attr("data-value", $target.html());
			},
			TClickFuc:function(e){
                $(".trainingPlace .TClick").removeClass('TClickActive');
				var $target = $(e.currentTarget);
				$target.addClass('TClickActive');
			},
			trainingPlaceCourseTwoClick:function(e){
                $(".trainingPlaceCourseTwoClick").removeClass('active');
				var $target = $(e.currentTarget);
				$target.addClass('active');
			},
			trainingPlaceEdit:function(){
                var url = 'com.ebt.guidedCourse/editGroup';
				this.navigateModule(url, {
					trigger: true
				});
			},
			//隐藏查询
			cancelBtn: function() {
				$('.searchDailog').hide();
				$('.masker').hide();
			},
			//显示查询
			search: function() {
				$('.masker').show();
				$('.searchDailog').show();
				console.log('========================');
			},
			//导航
			return2: function() {
				//var url = 'com.ebt.course/allCourse';
				//this.navigateModule(url, {
				//	trigger: true
				//});
				window.history.back();
			},
			//导航
			course_item: function(e) {
				$target = $(e.currentTarget);
				var courseId = $target.attr('data-courseid'),
					batchName = encodeURIComponent($target.attr('data-batchName'));
				var url = 'batchDetail?' + 'courseId='+courseId+'&batchName='+batchName
				// url = encodeURI(url);
				this.navigate(url, {
					trigger: true
				});
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					that.renderCourseListTemp();
				}
		
			}
		}); //view define

	});