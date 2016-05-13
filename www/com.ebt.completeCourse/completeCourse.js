define(['text!com.ebt.completeCourse/completeCourse.html', 'text!com.ebt.completeCourse/template/completeCourse_template.html', '../base/util', '../base/openapi', 'i18n!../base/nls/messageResource', 'i18n!../com.ebt.completeCourse/nls/completeCourse'],
	function(viewTemplate, completeCourse_template, Util, openApi, baseLocale, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.completeCourse_completeCourse',
			render: function() {
				var viewTemp = _.template(viewTemplate, {
						lang: Locale
					})
					//console.log(completeCourse_template);
				$(this.el).html(viewTemp + completeCourse_template);

				Piece.View.prototype.render.call(this);
				return this;
			},
			paramsObj: {
				cacheId: "completeCourse_completeCourse",
				isReloadRequest: false
			},
			myScroll: null,
			events: {
				
				'click .top-title>img': 'goBack',
				'click .show': 'search',
				'click .cancelBtn': 'cancelBtn',
				"click .chooseCourseTime": "chooseCourseTime",
				"click .confirmBtn": "queryCourse",
				"click .c_name":"detail"
				
				
				
			},
			
			
			chooseCourseTime: function() {
				//调用（显示）系统原生选择日期的控件
				var courseYear = $("#courseYear").text().substr(0, 4);
				var courseYearperiod = $('#courseYearperiod').text();
				cordova.exec(function(obj) {
					//$(".chooseCourseTime").text(obj);

					var words = obj.split("-");
					$("#courseYear").text(words[0] + Locale.year);
					courseYearperiod = $("#courseYearperiod").text(words[1]);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [10, courseYear + '-' + courseYearperiod]);
			},
			//刷新页面
			refresh: function() {
				this.onShow();
			},
			judgeMent: true,
			
			
			
			//请求后台的数据
			requestAjax: function(url, param) {
				Util.clearWarn(document.body);
				var that = this;
				Util.Ajax(
					//本地数据
					// openApi.completeCourse_template,
					// null,
					//后台数据
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
                            console.log(data)
							data.lang = Locale;
							that.renderTemp(data);
							
						} else {
							Util.ResultWarn(document.body, Locale.no_data);
						}
						that.redColor();
						that.getTimes();
					},
					null,
					function() {},
					null
					// ,that.paramsObj
				);
			},
			getTimes: function() {
				var date = new Date();
				var courseYear = date.getFullYear() + '年';
				$('#courseYear').text(courseYear);
				var courseMonth = date.getMonth() + 1;
				var courseYearperiod;
				if (courseMonth > 0 && courseMonth < 7) {
					courseYearperiod = Locale.firstHalfYear;
				} else {
					courseYearperiod = Locale.secondHalfYear;
				}
				$('#courseYearperiod').text(courseYearperiod);
			},
			//渲染模块，请求数据
			renderCourseListTemp: function() {
				var that = this;
				$('.title').text(Locale.completeCourse);
				var url = openApi.completeCourseList;
				var param = {
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken")
				};

				that.requestAjax(url, param);
				
			   
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
				var url = openApi.completeCourseList;
				var courseYear = $("#courseYear").html().substr(0, 4);
				var courseYearperiod = $("#courseYearperiod").html();
				
				
				var courseName = $("#courseName").val();
				var param = {
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken"),
					"courseYear": courseYear,
				};
				if(courseYearperiod=="上半年"){
					param.courseYearperiod=0;
				}
				if(courseYearperiod=="下半年"){
					param.courseYearperiod=1;
				}
				if (courseName!= '') {
					param.courseName = courseName;
				} 
				
				//从后台获取过滤的JSON,重新渲染模板
				if (Util.checkConnection()) {
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {

							if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
								console.log(data)
								data.lang = Locale;
								that.renderTemp(data);

								that.redColor();
							} else {
								$('#scroller').html('');
								Util.ResultWarn(document.body, Locale.query_no_record);
							};
							$(".title").html(Locale.searchResult);
						},
						null,
						function() {},
						null
						// ,that.paramsObj
					)
				} else {
					Piece.Toast(baseLocale.network_not_available);
				}
				//隐藏显示框
				that.cancelBtn();

			},
			
			//查询框取消,课程反馈取消
			cancelBtn: function() {
				$('.returnInfoDialog').hide();
				$('.searchDailog').hide();
				$('.masker').hide();
			},
			//显示查询框
			search: function() {
				$('.masker').show();
				$('.searchDailog').show();
				console.log('========================');
			},
			//返回主页
			goBack: function() {
				var url = 'com.ebt.course/allCourse';
				this.navigateModule(url, {
					trigger: true
				});
			},
			//未通过的改成红色
			redColor: function() {
				//var a = $passed[0].find('span').text();
				
				$('.pass_state').each(function(index, item) {
					var a = $(this).text();

					if (a == "未通过") {
						
						$(this).parent().css('background', 'red');
						
					}
				});
			},
			//请求result页面
			course_item: function(e) {
				var that = this;
				console.log($(e.target));
				$target = $(e.currentTarget);
				var dataLessonId = $target.attr('data-lessonid'),
					dataCourseId = $target.attr('data-courseid'),
					pf = $target.find('.pf').text(),
					pnf = $target.find('.pnf').text(),
					studentseat = $target.attr('data-studentseat'),
					//  skilledLevel = $target.find('.skilledLevel').text(),
					courseYear = $target.find('.courseYear').text(),
					courseName = $target.find('.courseName').text(),
					lessonType = $target.find('.lessonType').text(),
					resultId = $target.attr('data-resultid'),
					returnInfo = $('.returnInfoDialog');

				if (e.target.localName !== 'img') {
					var url = 'com.ebt.completeCourse/resultPage';
					var param = '?lessonid=' + dataLessonId + '&courseid=' + dataCourseId + '&courseName=' + courseName + '&pf=' + pf + '&pnf=' + pnf + '&studentseat=' + studentseat + '&courseYear=' + courseYear + '&lessonType=' + lessonType + '&resultid=' + resultId;
					url = encodeURI(url + param);
					this.navigateModule(url, {
						trigger: true
					});
				} else {
					return;
				}
			},
			renderTemp: function(data) {
				
				
				var that = this;
				var template = $('#completeCourse_template').html();
				
				var webSite =_.template(template)(data);
				
				$('#scroller').html("");
				$('#scroller').append(webSite);
				that.iScroll();
				
			},
			
            //查看详情得分
            detail:function(e){
            	var that=this;
            	var resultId=$(e.currentTarget).attr("data-value");
            	
				var url="lessonDetailScore"+"?resultId="+resultId;
				
				that.navigate(
					url,{trigger:true}
					)
            },
           
			onShow: function() {
				
				var that = this;

				if (!Util.checkConnection()) {
					
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					
					that.renderCourseListTemp();
				}
				
				that.getTimes()
			}
		}); //view define

	});