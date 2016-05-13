define(['text!com.ebt.course/coursePage.html', 'text!com.ebt.course/template/coursePage_template.html', '../base/util', '../base/openapi', '../base/date', 'i18n!../com.ebt.course/nls/courseall'],
	function(viewTemplate, coursePage_template, Util, OpenAPI, DateUtil, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.course_coursePage',
			myScroll: null,
			subject_wrapper: null,
			events: {
				"click .back": "goback",
				"click .zcun": "saveData",
				"click .submit": "goresult",
				"click .ul_subject li": "chooseAsideMenu",
				"click .sub_item_scoreStandard": "showScoreStandard",
				"click .chooseScore span": "selectScore",
				"click .repeat_pre": "repeat_reduce",
				"click .repeat_next": "repeat_add",
			},
			scroePageX: 0,
			// 备注span
			baseParams: null,
			$span: "<span style='color:#f00' class='warnStar'>*</span>",
			goback: function() {
				window.history.back();
			},
			repeat_reduce: function(e) {
				var $target = $(e.currentTarget);
				this.changeScore(0, $target);
			},
			repeat_add: function(e) {
				var $target = $(e.currentTarget);
				this.changeScore(1, $target);
			},
			// 重复次数设置
			changeScore: function(addOrCut, $target) {
				var $parents = $target.parents(".repeat_item");
				var $score = $parents.find(".score");
				var num = parseInt($score.text(), 10);
				if (addOrCut) {
					if (num >= 2) {
						new Piece.Toast(Locale.repeat_tip);
					}
					if (num < 3) {
						$score.text(++num);
					}
				} else {
					if (num > 0) {
						$score.text(--num);
					}
				}
				// 设置重复次数
				$parents.attr("data-value", num);

			},
			showScoreStandard: function(e) {
				var that = this,
					$tar = $(e.currentTarget),
					$sub_item = $tar.next(),
					$sub_item_detail_score = $sub_item.find(".sub_item_detail_score");
				var scoreStandardArr = that.getScoreStandard($sub_item_detail_score);
				that.LocalToast(scoreStandardArr, null, true);
			},
			getScoreStandard: function($tar) {
				var $standradArr = $tar.find("span"),
					standradArr = [];
				_.each($standradArr, function(item, index) {
					var itemStandrad = $(item).attr("data-remark");
					if (itemStandrad) {
						itemStandrad = $(item).text() + " " + itemStandrad;
						standradArr.push(itemStandrad);
					}
				});
				standradArr = standradArr.join("<br/>");
				return standradArr;
			},
			LocalToast: function(msg, duration, isfadeOut) {
				duration = isNaN(duration) ? 3000 : duration;
				var m = document.createElement('div');
				var masker = document.createElement('div');
				m.innerHTML = msg;
				masker.className = "scoreMasker";
				masker.style.cssText = "width:100%;height:100%;background:transparents; position:absolute; top:0; left:0; z-index:999999;";
				m.style.cssText = "width:60%; min-width:150px;max-height:500px; background:rgba(0,0,0,0.85);color:#fff; line-height:30px; border-radius:5px;font-size:20px; position:fixed; bottom:12%; left:20%; z-index:999999;padding:5px 10px";
				document.body.appendChild(masker);
				document.body.appendChild(m);
				if (!isfadeOut) {
					setTimeout(function() {
						var d = 0.5;
						m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
						m.style.opacity = '0';
						setTimeout(function() {
							document.body.removeChild(m);
						}, d * 1000);
					}, duration);
				}
				$(".scoreMasker").on("click", function() {
					$(m).remove();
					$(this).remove();
				});

				if (isfadeOut) {
					return m;
				}
			},
			selectScore: function(e) {
				var $target = $(e.currentTarget),
					$parents = $target.parents(".scoreNum"),
					// 获取备注target,获取分数项ID分数以及颜色值还有分数类型（预估or评定）
					curScoreId = $target.attr("data-scoreid"),
					curScore = $target.text(),
					curColor = $target.attr("data-color"),
					scoreType = $parents[0].classList[0];
				// 修改状态设置value值
				$target.addClass("active").siblings().removeClass("active");
				$parents.attr("data-value", curScore);
				$parents.attr("data-scoreid", curScoreId);
				// 当预评估分等于4或5的时候，就自动给成绩评定赋值为4或5
				if (curScore == "4" || curScore == "5") {
					if ($parents.hasClass("grade_item")) {
						this.checkIfAsycScore($parents, curScore, curScoreId);
					}
				}
			},
			// 当预评估分=4或5的时候，就自动给成绩评定=4或5
			checkIfAsycScore: function($parent, scorepar, curScoreId) {
				var $scoreItem;
				var itemScore;
				var scroeType = ".score_item";
				var $tar = $parent.parents(".sub_item").find(scroeType);
				$scoreItem = $tar.find(".sub_item_detail_score").find("span");
				if ($scoreItem.length < 1) {
					return;
				}
				_.each($scoreItem, function(item, index) {
					var score = $(item).text();
					if (score == scorepar) {
						itemScore = score;
						$(item).addClass("active").siblings().removeClass("active");
					}
				});
				$tar.attr("data-scoreid", curScoreId);
				$tar.attr("data-value", itemScore);
			},
			// 点击暂存与课程结果保存数据
			saveData: function(valid) {
				// 获取上传分数数据
				var options = {};
				var datainfo = this.setlocalScore(valid);
				// 如果没有填写分数值则返回
				if (!datainfo) {
					return;
				}
				options.scoreInfo = datainfo.scoreInfo;
				// 记录结束时间
				var dateEnd = new Date();
				this.baseParams.endTime = DateUtil.dateFormat(dateEnd, "yyyy-MM-dd hh:mm");
				// 如果valid参数为1则设为true,默认暂存为false
				this.baseParams.finish = false;
				if (valid == 1) {
					this.baseParams.finish = true;
				}
				// 继承默认参数对象
				options = _.extend(options, this.baseParams);
				// 上传分数参数
				// console.log(options);
				Util.cacheLessonInfoByType(this.baseParams, options, Util.CACHE_TYPE_UNFI);
				// 获取用来验证是否上传成功
				// var datatest = Util.getLessonInfoFromCacheByType(this.baseParams, 1);
				// console.log(datatest);
				// 同步分数到缓存(用来回显)
				this.updatelocaldata(options);
				return datainfo.Validation;

			}, // 获取上传分数参数0为暂存1，为课程结果验证
			setlocalScore: function(valid) {
				var that = this;
				// 用来验证
				$(".repeat_mess").attr("style", "");
				$(".ul_subject li").attr("style", "");
				$(".sub_item_title").attr("style", "");
				var Validation = true,
					ValidA = true,
					// 用来验证第0点
					ValidnullScore = true,
					repeatValue,
					// 用来存放验证状态和得分信息
					datainfo = {},
					$sub_list = $(".sub"),
					// 分数数组
					scoreInfo = [],
					// 验证分数数组
					scoreTestInfo = [],
					// console.log(item),
					// 科目
					scoreParam = null;
				_.each($sub_list, function(subitem, subindex) {
					// 用来验证第四点
					var ValidsameScore = true; // 检查项
					// console.log(subitem);
					var subjectId = $(subitem).attr("data-value"),
						checked = $(subitem).attr("data-checked"),
						must = $(subitem).attr("data-must"),
						$sub_item = $(subitem).find(".sub_item"),
						$repeat_item = $(subitem).find(".repeat_item"),
						repeatValue = $repeat_item.attr("data-value");

					//如果不是必填项不做验证	
					// if (must !== "true") {
					// 	return;
					// }

					// 重复次数从顶部获取
					_.each($sub_item, function(rtam_item, subindex) {
						var $rtam_item = $(rtam_item),
							$score_item = $rtam_item.find(".score_item"),
							$grade_item = $rtam_item.find(".grade_item");

						var rtamValue = $rtam_item.attr("data-value"),
							scoreValue = $score_item.attr("data-value"),
							scoreId = $score_item.attr("data-scoreid"),
							grade = $grade_item.attr("data-scoreid"),
							estimateValue = $grade_item.attr("data-value");
						// console.log(item);
						// 如果是第二课时或者第三课时预估评分为undefined，默认成""
						if (typeof grade == "undefined" || grade == "none") {
							grade = "";
						}
						scoreParam = {
							"subjectId": subjectId,
							"ratmId": rtamValue,
							"estimate": grade,
							"estimateValue": estimateValue || "0",
							"scoreId": scoreId,
							"scoreValue": scoreValue || "0",
							"repeat": repeatValue,
							"checked": checked || ""
						};
						// 如果valid===1,验证打分信息打分规则如下
						// must为必填项验证字段
						// 0分数不能为空
						// 1. 含预评估分和评定分数
						// 2. 当成绩评定与评估分不一致，重复次数不能为0，需要>=1
						// 3. 当重复次数=3，提示该操作已重复3次
						// 4. 如果选择与评估分和成绩评定一致，则不记录一次重复次数
						//例如，默认为4分，最后预估=5，评定=5，不记录重复次数
						if (valid === 1 && must === "true") {
							// 如果为第一课程
							if (that.baseParams.lessonNo == 1) {
								// 验证0点如果第一课程则预估评分不能为空
								if (estimateValue == "" || scoreValue == "") {
									ValidnullScore = false;
									$rtam_item.find(".sub_item_title").css({
										"color": "#f00"
									});
									$("li[data-value='" + subjectId + "']").css({
										"color": "#f00 !important"
									});

								}
								// 如果0点通过验证第二点
								if (ValidnullScore && estimateValue != scoreValue) {
									ValidsameScore = false;
									if (repeatValue == 0) {
										Validation = false;
										$(subitem).find(".repeat_mess").css({
											"color": "#f00"
										});
										$("li[data-value='" + subjectId + "']").css({
											"color": "#f00 !important"
										});
										return;
									}
								}
							}
							if (that.baseParams.lessonNo == 2 || that.baseParams.lessonNo == 3) {
								// 如果第2课程直接验证0点
								if (scoreValue == "") {
									ValidnullScore = false;
									$rtam_item.find(".sub_item_title").css({
										"color": "#f00"
									});
									$("li[data-value='" + subjectId + "']").css({
										"color": "#f00 !important"
									});
								}
							}
						}
						scoreTestInfo.push(scoreValue);
						// 将分数项加入数组
						scoreInfo.push(scoreParam);
					});
					if (valid === 1 && that.baseParams.lessonNo == 1) {
						// 用来验证第四点
						if (ValidsameScore && repeatValue > 0) {
							ValidA = false;
							$(subitem).find(".repeat_mess").css({
								"color": "#f00"
							});
							$("li[data-value='" + subjectId + "']").css({
								"color": "#f00 !important"
							});
							return;
						}

					}
				});
				if (valid === 1) {
					// 验证第0点
					if (!ValidnullScore) {
						new Piece.Toast(Locale.warnScore);
						return;
					}
					// 验证第二点
					if (!Validation) {
						new Piece.Toast(Locale.repeat_tip1);
						return;
					}
					if (!ValidA) {
						// 验证第四点
						new Piece.Toast(Locale.repeat_tip2);
						return;
					}
					var unipArr = _.uniq(scoreTestInfo);
					if (scoreTestInfo.length > 1 && unipArr.length < 2) {
						new Piece.Toast(Locale.warnTip);
						return;
					}
				}
				// 验证第四点
				datainfo.scoreInfo = scoreInfo;
				datainfo.Validation = Validation;
				if (valid != 1) {
					new Piece.Toast(Locale.zcSuccess);
				}
				console.log('同步分数并且验证=========：');
				console.log(datainfo);
				return datainfo;
			},
			// 同步分数到缓存
			updatelocaldata: function(options) {
				console.log("updatebegin");
				console.log('scoreoption========:');
				console.log(options);
				// 取出数据进行对比
				var courseId = this.baseParams.courseId;
				// 目前写死了
				var data = Util.getDownloadCourse(courseId);
				var params = this.baseParams; // 根据参数获取课时信息
				var courseData = data.result.lessons[params.lessonNo - 1];
				courseData = _.extend(courseData, params);
				_.each(courseData.seqs, function(seq_item, index) {
					_.each(seq_item.subjects, function(subject_item, index) {
						_.each(subject_item.ratms, function(ratms_item, index) {
							// console.log(subject_item);
							// 将页面数据与缓存数据对比修改缓存数据
							_.each(options.scoreInfo, function(item, index) {
								// 如果科目ID与检查要素ID都相等，则为缓存数据新增分数字段
								if (subject_item.subjectId == item.subjectId && ratms_item.ratmId == item.ratmId) {
									ratms_item.scoreId = item.scoreId;
									ratms_item.scoreValue = item.scoreValue;
									ratms_item.repeat = item.repeat;
									ratms_item.estimate = item.estimate;
									ratms_item.estimateValue = item.estimateValue;
									// 设置重复次数
									subject_item.repeat = item.repeat;
									// 记录是否被点击
									subject_item.checked = item.checked;
								}
							});
						});
					});
				});
				Util.cacheLessonInfoByType(this.baseParams, courseData, Util.CACHE_TYPE_UNFI_4_DISP);
				console.log("update  courseData=================:");
				console.log(courseData);
			},
			goresult: function() {
				// 参数为1标识要验证分数结果
				var goresult = this.saveData(1);
				console.log("goresult:", goresult);
				// 如果验证通过则跳转
				if (goresult) {
					this.navigate("resultPage", {
						trigger: true
					});
				}
			},
			// 渲染模板方法
			renderTemp: function() {
				var that = this;
				// 获取基本参数
				var params = Piece.Store.loadObject("baseParams") || {};
				//获取暂存的数据
				var courseInfo = Piece.Session.loadObject("courseInfo");
				// 如果从待完成页面过来根据传递的参数回显数据
				var pageFrom = Util.parseUrl();
				if (courseInfo && pageFrom && pageFrom.from == "toBeFinish") {
					params = _.extend(params, courseInfo);
				}
				// console.log(params);
				console.log(Util.CACHE_TYPE_UNFI_4_DISP);
				var data = Util.getLessonInfoFromCacheByType(params, Util.CACHE_TYPE_UNFI_4_DISP);
				// console.log(data);
				// 如果有回显的数据，就用回显数据，没有就取原始数据
				if (!data) {
					data = Util.getDownloadCourse(params.courseId);
					courseData = data.result.lessons[params.lessonNo - 1];
					data = courseData;
					// 将lessonNo赋给data,用来判断是否隐藏预估评分或者重复次数
					// data.lessonNo = params.lessonNo;
				}
				// console.log(data);
				// 如果没有startTime,设置默认参数startTime（如果是回显数据是会有starttime的）
				if (!params.lessonDate) {
					var date = new Date();
					params.lessonDate = DateUtil.dateFormat(date, "yyyy-MM-dd");
					params.startTime = DateUtil.dateFormat(new Date(parseInt(params.startTime, 10)), "yyyy-MM-dd hh:mm");
				}
				// 为了防止暂存的时候otherinfo为空，将取出来的数据设置到默认数据中
				if (data) {
					data.lang = Locale;
					if (data.otherInfo) {
						params.otherInfo = data.otherInfo;
					}
				} else {
					Util.ResultWarn(that.el, Locale.nodata);
				}
				this.baseParams = params;
				Piece.Store.saveObject("baseParams", params);
				// 设置默认参数end
				var template = $('#coursePage_template').html();
				var webSite = _.template(template, data);
				$('.content').append(webSite);
				this.setHeaderinfo();
				this.setdefaultScroller();
				this.subject_wrapper = new iScroll("subject_wrapper");
			},
			// 左侧菜单栏
			chooseAsideMenu: function(e) {
				var that = this,
					$target = $(e.currentTarget),
					$partarget = $target.parent(),
					subjectId = $target.attr("data-value"),
					menuSequence = $partarget.attr("data-value");
				// 修改菜单栏样式
				$partarget.parent().find("li").removeClass("active");
				$target.addClass("cD active");
				// 根据id展示右边的项目
				$(".sequence").hide();
				$(".sub").hide();
				$("#wrapper" + subjectId).parents(".sequence").show();
				$(".sub" + subjectId).attr("data-checked", true);
				$(".sub" + subjectId).show();
				var $currentScro = $("#wrapper" + subjectId);
				that.myScroll = new iScroll($currentScro[0]);
			},
			// 设置默认滚动项
			setdefaultScroller: function() {
				var that = this;
				var $firSeq = $(".sequence").eq(0);
				var $firSub = $firSeq.find(".sub").eq(0);
				$firSeq.show().siblings().hide();
				$firSub.attr("data-checked", true);
				var scrolltarget = $firSub.children("div")[1];
				that.myScroll = new iScroll(scrolltarget);
			},
			render: function() {
				//添加国际化
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板
				viewT = coursePage_template + viewT;
				$(this.el).html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				var pageFrom = Util.parseUrl();
				that.renderTemp();

				//区分开教员和学员
				if (that.baseParams.planId !== null) {
					var planSuccess = false;
					//如果不是从未完成来的，记录开始的plansId
					if (!pageFrom || (pageFrom && pageFrom.from !== "toBeFinish")) {
						Util.Ajax(
							OpenAPI.start, {
								planId: that.baseParams.planId,
								access_token: Piece.Session.loadObject("accessToken")
							},
							null,
							function(data) { //成功

								planSuccess = true;

								Piece.Session.deleteObject("plans");

								//暂存一下
								that.saveData();

								$(".content").css({
									height: "678px"
								});
							},
							null,
							function() { //complete失败
								if (!planSuccess) {
									$(".BtnLabel").hide();
									$(".footer-menu").show();
								}
							}
						);
					}
				} else { //学员，隐藏暂存和课程结束按钮
					$(".BtnLabel").hide();
					$(".footer-menu").show();
				}
			},
			setHeaderinfo: function() {
				var courseInfo = {},
					studentInfo = {},
					stuSeat = "",
					Params, courseInfoText, studentInfoText;
				Params = this.baseParams;
				// console.log("Params=======");
				// console.log(Params);
				if (Params.studentSeat == "L") {
					stuSeat = Locale.stuPF;
				} else if (Params.studentSeat == "R") {
					stuSeat = Locale.stuPNF;
				}

				var data = Util.getDownloadCourse(Params.courseId);
				if (data) {
					var result = data.result;
					courseInfo.courseYear = result.courseYear || "";
					courseInfo.courseYearperiod = result.courseYearperiod || "";
					courseInfo.actype = result.actype || "";
					courseInfo.courseType = result.courseType || "";
					courseInfo.lessonNo = Params.lessonNo || "";
					courseInfo.lessonType = Params.lessonType || "";
					courseInfo.courseName = result.courseName || "";
					// studentInfo.studentSeat = Params.studentSeat || "";
					studentInfo.studentId = Params.studentId || "";
					studentInfo.pnf = Params.pnf || "";
					// courseInfoText = [courseInfo.courseYear + Locale.year,
					// 	courseInfo.courseYearperiod,
					// 	courseInfo.actype + Locale.acType,
					// 	courseInfo.courseType + Locale.course,
					// 	Locale.the + courseInfo.lessonNo + Locale.lesson,
					// 	"(" + courseInfo.lessonType + ")"
					// ].join("");
					courseInfoText = courseInfo.courseName + " 第" + courseInfo.lessonNo + "课（" + courseInfo.lessonType + "）";
					// studentInfoText = ["PF：" + studentInfo.studentId,
					// 	"(" + stuSeat + ")",
					// 	" | ",
					// 	"PNF：" + studentInfo.pnf
					// ].join("");
					studentInfoText = ["学员：" + Params.studentId,
						" | ",
						"教员：" + Params.instructorId
					].join("");
				}
				$(".courseInfo").html(courseInfoText);
				$(".studenttype").html(studentInfoText);

			}
		}); //view define

	});