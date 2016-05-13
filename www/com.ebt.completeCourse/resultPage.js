define(['text!com.ebt.completeCourse/resultPage.html', 'text!com.ebt.completeCourse/template/completeResultPage_template.html', /*'text!com.ebt.completeCourse/template/completeResultFeedback_template.html',*/
 '../base/util', '../base/openapi', 'i18n!../base/nls/messageResource', 'i18n!../com.ebt.completeCourse/nls/resultPage','text!com.ebt.report/template/ownReportDetail_template.html','i18n!../com.ebt.report/nls/ownReportDetail','com.ebt.trainResultView/flotr.amd'],
	function(viewTemplate, completeResultPage_template, /*completeResultFeedback_template,*/ Util, OpenAPI, baseLocale, Locale,reportTemplate,reportLocale,Flotr) {
		return Piece.View.extend({
			id: 'com.ebt.completeCourse_resultPage',
			events: {
				'click .imgUl': 'returnInfoDialog',
				'click .commitBtn': 'commitData',
				'click .cancelBtn': 'hideInput',
				"input textarea": "wordsTip"
			},
			//检测还能输多少字
			wordsTip: function() {
				var wordLen = 200 - $('textarea').val().length;
				var tip = Locale.input + wordLen + Locale.word;
				$('.wordsTip').text(tip);
			},
			//字符超出提示信息
			beyondInfo: function(event) {
				var value = $('textarea').val();
				//console.log(typeof value.length);
				if (value.length >= 200) {
					Piece.Toast(Locale.tip);
				}
			},
			headerContent: function() {
				// $('.time.leftTop').text(courseYear + courseName + lessonType);
				$('.time.leftTop').text(courseName + lessonType);
				$('.pfName').text(pf);
				$('.pnfName').text(pnf);
				if (studentseat == "L") {
					studentseat = Locale.stuPF;
				} else if (studentseat == "R") {
					studentseat = Locale.stuPNF;
				}
				$('.pnfSkillLevel').text(studentseat);
			},
			lessonId: null,
			courseId: null,
			resultId: null,
			pf: null,
			pnf: null,
			studentseat: null,
			courseYear: null,
			courseName: null,
			//获取lessonid的值
			getParams: function() {
				var url = location.href;
				url = decodeURI(url);
				var getParam = Util.parseUrl(url);
				// this.splitParams();
				// var getParam = new splitParams();
				// console.log(getParam);
				lessonId = getParam['lessonid'];
				//console.log(lessonId);
				courseId = getParam['courseid'];
				resultId = getParam['resultid'];
				pf = getParam['pf'];
				pnf = getParam['pnf'];
				studentseat = getParam['studentseat'];
				courseYear = getParam['courseYear'];
				courseName = getParam['courseName'];
				lessonType = getParam['lessonType'];
			},
			//提交申诉
			commitData: function(e) {
				var that = this;
				that.getParams();
				var value = $('textarea').val().trim();
				$target = $(e.currentTarget);
				var subjectId = $('.template').attr('data-subjectid');
				var param = {
					"courseId": courseId,
					"lessonId": lessonId,
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken"),
					"subjectId": subjectId
				}
				if (value == '') {
					Piece.Toast(Locale.content);
				} else {
					param.content = value;
					console.log(param);
					// var netWorkState = navigator.network.connection.type || navigator.connection.type;
					// if (Connection.NONE == netWorkState) {
					// 	new Piece.Toast(baseLocale.network_not_available);
					// 	return;
					// } else {
					Util.Ajax(
						OpenAPI.newFeedback,
						param,
						null,
						function(data, textStatus, jqHRX) {
							console.log(data);
							that.commitSuccess(data);
						},
						function(e, xhr, type) {
							Piece.Toast(Locale.feedback_commit_fail);
						},
						null,
						null
					);
					// };
					$('textarea').val('');
					$('.returnInfoDialog').hide();
					$('.masker').hide();
				}
			},
			//提交成功
			commitSuccess: function(data) {
				if (data.resultCode == 0) {
					new Piece.Toast(Locale.complaintSuccess);
				} else {
					new Piece.Toast(Locale.complaintFail);
				}
			},
			//加红色小球
			redCount: function() {

				$.each($('.checkElement'), function(index, item) {
					var color = $(this).attr('data-color');
					if (color === '#f00' || color === 'red' || color === '#F00' || color === '#ff0000' || color === '#FF0000') {

						// $.each($('.redCount'),function(index,item){
						// 	var text = parseInt($(this).text());
						// 	if(text<3){
						$(this).find('.redCount div').addClass('redCircle');
						$(this).find('.redCount span').css('color', 'white');
						console.log($(this));
						// 	}
						// 	//console.log(typeof text);
						// })
					}
				})

			},
			//平均分数
			countScore: function() {
				$.each($('.template'), function(index, item) {
					var esti = 0,
						scor = 0,
						rep = 0;
					var estimate = $(this).find('.checkElement .estimate').find('span');
					var score2 = $(this).find('.checkElement .score2').find('span');
					var repeat = $(this).find('.checkElement .repeat').find('span');

					var that = $(this);

					function eachItem(obj) {
						var name = '.' + $(obj).parent().attr('class');
						var priScore = 0;
						if (name.match('redCount')) {
							name = '.score2';
						}
						//console.log(typeof name);
						$.each(obj, function(index_obj, item_obj) {
							priScore = parseInt(item_obj.innerHTML) + priScore;
						});
						priScore = (priScore.toFixed(1) / obj.length).toFixed(1);
						// 重复次数没有小数点
						if (repeat == obj) {
							priScore = parseInt(priScore).toFixed(0);
						}
						that.find('.lesson').find(name).text(priScore);
					}
					if (lessonType.match(Locale.thirdCourse)) {
						eachItem(score2);
						$.each($(item).find('.estimate span'), function(index, item_s) {
							$(item_s).text('');
						})
						$.each($(item).find('.repeat span'), function(index, item_s) {
							$(item_s).text('');
						})
						$('.sup_list .estimate').text('');
						$('.sup_list .repeat').text('');
					} else if (lessonType.match(Locale.secondCourse)) {
						eachItem(score2);
						eachItem(repeat);
						var width = $('.sup_list').width() * 0.49;
						$('.estimate').hide(width);
						$('.score2').width(width);
						$('.repeat').width(width);
					} else {
						eachItem(estimate);
						eachItem(score2);
						eachItem(repeat);
					}
				});
			},
			render: function() {
				var viewTemp = _.template(viewTemplate, {
					lang: Locale
				});
				$(this.el).html(viewTemp + completeResultPage_template + reportTemplate);
				Piece.View.prototype.render.call(this);
				return this;
			},
			//显示课程申诉框
			returnInfoDialog: function() {
				this.wordsTip();
				$('.returnInfoDialog').show();
				$('.masker').show();
			},
			//隐藏课程申诉框
			hideInput: function() {
				$('.returnInfoDialog').hide();
				$('.masker').hide();
			},
			//添加模块
			renderTemp: function() {
				var that = this;
				that.getParams();
				var param = {
					"courseId": courseId,
					"lessonId": lessonId,
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken"),
					"resultId": resultId
				};

				Util.Ajax(
					//本地数据
					// OpenAPI.completeResultPage_template,
					// null,
					//后台数据
					OpenAPI.queryLessonScore,
					param,
					null,
					function(data, text, jqHRX) {
						console.log(data);
						//判断有没有数据，数据是否为空
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							data.lang = Locale;
							var template = $('#completeResultPage_template').html();
							//console.log(template);
							var webSite = _.template(template, data);
							$('.content').append(webSite);
							that.redCount();
							that.countScore();
              
              //获取report
              var url = OpenAPI.query_report;
              var resultId = Util.parseUrl().resultid;
              var param = {
                "resultId": resultId,
                "access_token": Piece.Session.loadObject("accessToken")
              };
              that.requestAjax(url, param);
              
							// that.scroll();
						} else {
							Util.ResultWarn(document.body, Locale.no_data);
						}
					},
					function(e, xhr, type) {
						//new Piece.Toast(baseLocale.request_fail);
					},
					function() {},
					null
				);
			},
      renderAbilityPic: function(data) {
				var that = this;
				var renderData;
				renderData = data.result.abilitys;
				that.canvasCode(renderData);
			},
			canvasCode: function(data) {
				if (!_.isEmpty(data)) {
					var container = document.getElementById("ability_pic");

					function basic(container) {
						// Radar Labels
						var item = "item";
						var score = "score";
						var TYPE = "items";
						var ticks = [];
						var DATA = [];
						for (var i = 0; i < data[TYPE].length; i++) {
							var ticksItem = [];
							var DATAItem = [];
							ticksItem.push(i);
							ticksItem.push(data[TYPE][i].item)
							ticks.push(ticksItem);
							// 
							DATAItem.push(i);
							DATAItem.push(data[TYPE][i].score)
							DATA.push(DATAItem);

						}
						//  console.error(DATA);
						var s1 = {
								data: DATA
							},
							graph;
						// Draw the graph.
						graph = Flotr.draw(container, [s1], {
							radar: {
								show: true
							},
							grid: {
								circular: true,
								minorHorizontalLines: true
							},
							yaxis: {
								min: data.min,
								max: data.max,
								minorTickFreq: 1
							},
							xaxis: {
								ticks: ticks
							},
							mouse: {
								track: true
							}
						});
					}
					basic(container);
				} else {
					//先请空canvas
					$(".ability_pic").html("");
				}
			},
      showIfPass: function(data) {
				var that = this;
				var passed;
				passed = data.result.iPassed ? "合格" : "不合格";
				$(".conclusion_result").text(passed);
				if (!data.result.iPassed) {
					$(".conclusion_result").css({
						"color": "#f00"
					});
				}
			},
      renderTemplate: function(data) {
				var that = this;
				var template = $('#ownReportDetail_template').html();
				var webSite = _.template(template, data);
        $("#ownReportTitle").html(data.result.courseName + " 第" + data.result.lessonNo + "课("+data.result.lessonType+")报告");
				$(".cantainer").html("");
				$(".cantainer").html(webSite);
				$(".cantainer").show();
        that.scroll();
			},
      renderpage: function(data) {
				var that = this;
				that.renderTemplate(data);
				// 渲染能力图
				that.renderAbilityPic(data);
        //训练课隐藏结论
        if (data.result.lessonType === "训练") {
          $(".conclusion").css({display : "none"});
        } else {
          // 显示是否通过
          that.showIfPass(data);
        }
				// 初始化iscroll
				// that.initIscroll();

			},
      requestAjax: function(url, param) {
				Util.clearWarn(document.body);
				var that = this;
				var paramObject = {};
				Util.Ajax(
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
							data.lang = reportLocale;
							that.renderpage(data);
						} else {
							// $('#scroller').html('');
							Util.ResultWarn(document.body, reportLocale.no_data);
						};
					},
					null,
					function() {},
					null
					// ,that.paramsObj
				);
			},
			//滑动
			scroll: function() {
				var height = $('.courseList').height();
				$('.courseList').height(height);
				var myiScroll = new iScroll('wrapper', {
					checkDOMchanges: true
				});
			},
			//没有网络提示
			// noData:function(){
			// 		$('.content').hide();
			// 		Util.ResultWarn(document.body,baseLocale.network_not_available);
			// },
			onShow: function() {
				//write your business logic here :)
				var that = this;
				//this.addTemp();
				if (!Util.checkConnection()) {
					//that.noData();
					Piece.Toast(baseLocale.network_not_available);
				} else {
					this.renderTemp();
					//this.addClass();
					//that.getParams();
					that.headerContent();
				}
				//setTimeout(that.countScore,300);
				//that.getParams();
			}
		}); //view define

	});