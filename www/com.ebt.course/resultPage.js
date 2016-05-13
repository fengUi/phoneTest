define(['text!com.ebt.course/resultPage.html', 'text!com.ebt.course/template/resultPage_template.html', '../base/util', '../base/openapi', '../base/components/remark', 'i18n!../com.ebt.course/nls/courseall', '../base/date'],
	function(viewTemplate, templateContent, Util, OpenAPI, Remark, Locale, DateUtil) {
		return Piece.View.extend({
			id: 'com.ebt.course_resultPage',
			render: function() {
				//添加模板
				me = $(this.el);
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板
				viewT = templateContent + viewT;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			events: {
				// "click .remark": "showRemark",
				"click .masker": "hideWarnItemDailog",
				// "click .remarkTextIcon img": "showRemark",
				"change .remark-input": "remarkInputChange",
				"click .remarkText img": "remarkInputFocus",
				"click .zcun": "scratchData",
				'click .sub_title_pic img': 'handelCore',
				"click .submit": "uploadHandle",
				"click .verifiLession": "verifiLession",
				"click .score_item .score_pre": "score_reduce",
				"click .score_item .score_next": "score_add",
				"click .repeatAver .score_pre": "repeat_reduce",
				"click .repeatAver .score_next": "repeat_add",
				"click .advan-list li": "chooseWarnItem",
				"click .advan-cancel": "advanCancelHandler",
				"click .advan-confirm": "advanCanfirmHandler",
				"keydown textarea.mainMsg": "wordsTip",
				"click .upload_Confirm": "upload_Confirm",
				"click .upload_Confirm2": "upload_Confirm2",
				"click .upload_cancel": "upload_cancel",
				"click .upload_cancel2": "upload_cancel2",
				"change .otherinfo_text": "otherinfoChange",
				"change input[name='pass']": "passChange",
			},
			baseParams: null,
			myScroll: null,
			tip_titile: Locale.remark_title,
			otherinfo_titile: Locale.otherInfo_title,
			// 将剩余的补充上然后跳转到带上传页面
			uploadHandle: function() {
				var data, dataA, courseData, options;
				data = this.saveData();
				// 获取补充评语等参数
				dataA = this.getLeftData();
				// 如果验证没有通过则返回
				if (!dataA) {
					return
				}
				//弹出提示语
				$(".masker").show();
				$(".uploadTip2").show();
			},
			upload_Confirm2: function() {
				$(".masker").hide();
				$(".uploadTip2").hide();
				Piece.Store.deleteObject("cache_comment");
				Piece.Store.deleteObject("cache_otherinfo");
				// 如果完成上传
				// 收集参数待提升能力数组,是否通过,补充评语
				var that = this;
				var data = this.saveData();
				var dataA = this.getLeftData();

				// 合并参数上传课程
				if (data) {
					// 同步红黄项备注到上传分数数组
					scoreInfo = that.mergeRedYelOptions(data.options.scoreInfo);
					if (!scoreInfo) {
						return;
					}
					data.options.scoreInfo = scoreInfo;
					data.options = _.extend(data.options, dataA);
					Util.cacheLessonInfoByType(this.baseParams, data.options, Util.CACHE_TYPE_PEND);
					Util.cacheLessonInfoByType(this.baseParams, data.courseData, Util.CACHE_TYPE_PEND_4_DISP);
					//保存改进措施
					// window.sessionStorage.setItem("improveHTML", $(".advan-checked-list").html());
					// that.goUploadPage();
					this.navigateModule("com.ebt.ResultsUpload/ResultsUpload", {
						trigger: true
					});
				}
			},
			upload_cancel2: function() {
				$(".masker").hide();
				$(".uploadTip2").hide();
			},
			mergeRedYelCourseData: function(data) {
				var that = this;
				var dataR = that.syncRemark(data);
				return dataR;
			},
			mergeRedYelOptions: function(data) {
				var that = this;
				var scoreInfo = that.syncRemarkA(data);
				return scoreInfo;
			},
			syncRemarkA: function(data) {
				var that = this;
				var $proRoot, $problemItems;
				// var ifhasRemark = true;
				$proRoot = $(".problem_list");
				$problemItems = $proRoot.find(".problemItems");
				_.each($problemItems, function(item, index) {
					// if (!ifhasRemark) {
					// return
					// }
					var subjectid = $(item).attr("data-subjectid");
					var remark = $(item).find(".problem-title").attr("data-remark");
					// 遍历data同步备注
					_.each(data, function(socreItem, index) {
						// if (socreItem.subjectId == subjectid) {
						// var $problems = $(item).find(".problem_item");
						// _.each($problems, function(problem, index) {
						// var ratmid = $(problem).attr("data-ratmid");
						// var remark = $(problem).attr("data-remark");
						// if (!remark) {
						// ifhasRemark = false;
						// }
						// if (socreItem.ratmId == ratmid) {
						// socreItem.remark = remark;
						// }
						// });
						// }
						if (socreItem.subjectId === subjectid) {
							socreItem.remark = remark;
						}

					});
				});
				// if (!ifhasRemark) {
				// new Piece.Toast("请填写红黄项");
				// return false;
				// }
				return data;
			},
			syncRemark: function(data) {
				var that = this;
				var $proRoot, $problemItems;
				var ifhasRemark = true;
				$proRoot = $(".problem_list");
				$problemItems = $proRoot.find(".problemItems");
				_.each($problemItems, function(item, index) {
					if (!ifhasRemark) {
						return
					}
					var subjectid = $(item).attr("data-subjectid");
					// 遍历data同步备注
					_.each(data.seqs, function(seq, index) {
						_.each(seq.subjects, function(subject, index) {
							if (subject.subjectId == subjectid) {
								var $problems = $(item).find(".problem_item");
								_.each($problems, function(problem, index) {
									var ratmid = $(problem).attr("data-ratmid");
									var remark = $(problem).attr("data-remark");
									if (!remark) {
										ifhasRemark = false;
									}
									_.each(subject.ratms, function(ratm, index) {
										if (ratm.ratmId == ratmid) {
											ratm.remark = remark;
										}
									});
								});
							}
						});

					});
				});
				if (!ifhasRemark) {
					new Piece.Toast("请填写红黄项");
					return false;
				}
				return data;
			},
			goUploadPage: function() {
				var that = this;
				// this.navigateModule("com.ebt.ResultsUpload/ResultsUpload", {
				// trigger: true
				// });
				if (this.uploadResult) {
					var tip = that.messTip(that.uploadResult);
				} else {
					return;
				}
				tip = encodeURIComponent(tip);
				that.navigate("resultGather?message=" + tip, {
					trigger: true
				});
			},
			messTip: function(argum) {
				console.log(argum);
				/*
				-1 - 不用显示
				0 - 不通过
				1 - 通过
				*/
				var tip;
				var errorResult = argum.errorResult;
				var succResult = argum.succResult;
				if (errorResult.length > 0) {
					if (errorResult[0].resultData && errorResult[0].resultData.resultCode == 1) {
						tip = Locale.unknowenStu;
					} else {
						tip = Locale.unknowenpass;
					}
				} else if (succResult.length > 0) {
					if (succResult[0].resultData) {
						var pass = succResult[0].resultData.result.passed;
						if (pass == "1") {
							tip = Locale.succpass;
						} else if (pass == "0") {
							tip = Locale.failpass;
						} else if (pass == "-1") {
							tip = "noshow";
						}
					}
				}
				return tip;
			},
			remarkInputChange: function(e) {
				var $el = $(e.currentTarget);
				var $parent = $el.parent().parent();
				var $super = $parent.parent();
				var color;
				if ($el.val() === "") {
					$parent.removeAttr("data-remark");
				} else {
					var cache = Piece.Store.loadObject("cache_otherinfo") || {};
					cache.remark = cache.remark || {};
					if ($super.parent().parent().hasClass("red_problem")) {
						color = "red";
					} else if ($super.parent().parent().hasClass("yel_problem")) {
						color = "yel";
					}
					cache.remark[color + $parent.parent().attr("data-subjectid")] = $el.val();
					Piece.Store.saveObject("cache_otherinfo", cache);
					$parent.attr("data-remark", $el.val());
				};
			},
			remarkInputFocus: function(e) {
				var $el = $(e.currentTarget);
				$el.prev()[0].focus();
			},
			// 获取补充评语等参数
			getLeftData: function() {
				var that = this;
				var ability, ifPass, result, otherInfo, problems, remarks, paramObj = {};

				// problems = $(".problem_item");
				problems = $(".problem-title");
				remarks = $("div[data-remark]").length;
				//标红未填备注的红黄项
				_.forEach(problems, function(item, index) {
					if (!item.getAttribute("data-remark")) {
						$(item).addClass("required");
					} else {
						$(item).removeClass("required");
					}
				});
				if (problems.length !== remarks) {
					new Piece.Toast("请填写红黄项备注必填项");
					return;
				}
				// 判断是否有必填的待提升项目没有填写
				var check = that.checkAbility();
				if (!check) {
					new Piece.Toast("请选择待提升能力必填项");
					return;
				}
				ability = that.localAbility;

				//检查是否需要填写补充评语，参考结论和教员结论不一致时要填写评语
				var $otherInfo = $(".otherinfo_text");
				if ($otherInfo.length) {
					otherInfo = $(".otherinfo_text")[0].value.trim();
					if (!otherInfo &&
						(($(".summary-refer-span").html() === "不通过" && $("input[name='pass']:checked").val() === "pass") || ($(".summary-refer-span").html() === "通过" && $("input[name='pass']:checked").val() === "unpass"))) {
						new Piece.Toast("结论与参考结论不一致，请填写补充评语");
						return;
					}
				}

				if (this.baseParams.lessonNo == 3) { //总结(第三课时才显示)
					ifPass = that.getIfPass();
					if (!ifPass) {
						new Piece.Toast("请选择是否合格");
						return;
					}
					if (ifPass == "pass") {
						result = true;
					} else {
						result = false;
					}
					paramObj.result = result;
				}

				paramObj.ability = ability;
				paramObj.otherInfo = otherInfo;
				return paramObj;
			},
			checkAbility: function() {
				var check;
				var arr = this.localAbility.filter(function(item, index) {
					return (item.passed == false && item.check == false);
				});
				check = !arr.length;
				return check;
			},
			getIfPass: function() {
				var ifPass = "";
				$radio = $("#summary").find("input");
				_.each($radio, function(item, index) {
					if (item.checked) {
						ifPass = item.value;
					}
				});
				return ifPass;
			},
			// 验证数据
			verifiLession: function() {
				var that = this;
				var data;
				// 关闭可编辑状态
				// that.closeEditPic();
				// 是否打完分
				data = this.saveData();
				if (data) {
					// 获取用来验证是否上传成功
					// var datatest = Util.getLessonInfoFromCacheByType(this.baseParams, 1);
					Util.cacheLessonInfoByType(this.baseParams, data.options, Util.CACHE_TYPE_UNFI);
					Util.cacheLessonInfoByType(this.baseParams, data.courseData, Util.CACHE_TYPE_UNFI_4_DISP);
					// 上传分数
					this.uploadScore(Util.CACHE_TYPE_UNFI, that.compelteUpload, true);
				}
			},
			closeEditPic: function() {
				// $(".sub_item").find(".showCore").click();
				var showCore = $(".showCore");
				var editCore = $(".editCore");
				var toggleDown = $(".toggleDown");
				var toggleUp = $(".toggleUp");
				var sub_item_detail = $(".sub_item_detail");
				var itemCantain = $(".itemCantain");

				showCore.each(function() {
					this.style.display = "none";
				});
				editCore.each(function() {
					this.style.display = "inline";
				});
				toggleDown.each(function() {
					this.style.display = "none";
				});
				toggleUp.each(function() {
					this.style.display = "inline";
				});
				sub_item_detail.each(function() {
					this.style.display = "none";
				});
				itemCantain.each(function() {
					this.style.display = "none";
				});
			},
			// 暂存数据
			scratchData: function() {
				var data;
				data = this.saveData();
				if (data) {
					Util.cacheLessonInfoByType(this.baseParams, data.options, Util.CACHE_TYPE_UNFI);
					Util.cacheLessonInfoByType(this.baseParams, data.courseData, Util.CACHE_TYPE_UNFI_4_DISP);
				}
				Piece.Toast(Locale.zcSuccess);
			},
			uploadScore: function(type, callBack, iftrial) {
				var that = this,
					uploadParam = [],
					Params = this.baseParams;
				var param = {},
					courseTip,
					instructorid = Params.instructorId,
					studentid = Params.studentId,
					courseid = Params.courseId,
					lessonid = Params.lessonId;
				param = {
					"instructorId": instructorid,
					"studentId": studentid,
					"courseId": courseid,
					"lessonId": lessonid,
					"type": type
				};
				uploadParam.push(param);
				console.log("uploadParam-----");
				console.log(uploadParam);
				// 如果没有网络直接提示没有网络跳转不执行下面的流程
				var checkNet = that.checkConnection();
				if (!checkNet) {
					new Piece.Toast(Locale.no_net);
					return;
				}
				// 上传分数后验证逻辑
				Util.uploadLessons(uploadParam, callBack.bind(that), iftrial);
			},
			checkConnection: function() {
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					return false;
				}
				return true;
			},
			compelteUpload: function(data) {
				var that = this;
				this.uploadResult = data; //保存上传课程返回的结果
				// 根据返回字段渲染页面，包括红黄项，待提升能力项等
				var errorResult = data.errorResult.length;
				if (errorResult) {
					new Piece.Toast("分数验证不成功，请重试");
					return;
				}
				Piece.Store.saveObject("cache_comment", data);
				//弹出提示语
				$(".masker").show();
				$(".uploadTip").show();
				switch (data.succResult[0].resultData.result.passed) {
					case "-1":
						break;
					case "0":
						$(".ifPassStatus").removeClass("bggreen").addClass("bgred");
						$(".ifPassText").html("不通过");
						break;
					case "1":
						$(".ifPassStatus").removeClass("bgred").addClass("bggreen");
						$(".ifPassText").html("通过");
						break;
				}
			},
			upload_Confirm: function() {
				var that = this;
				$(".masker").hide();
				$(".uploadTip").hide();
				// 关闭可编辑状态
				that.closeEditPic();
				//渲染评语页
				that.renderAfterUploadScore(that.uploadResult);
				//去掉返回按钮
				that.removeBackIcon();
				// 去掉暂存按钮
				that.removeZanchu();
				//去掉分数编辑图标
				that.removeEditPic();
			},
			upload_cancel: function() {
				$(".masker").hide();
				$(".uploadTip").hide();
			},
			removeEditPic: function() {
				$(".scorelist").find(".editCore,.showCore").css({
					"visibility": "hidden"
				});
			},
			removeBackIcon: function() {
				$(".back").remove();
			},
			removeZanchu: function() {
				$(".zcun").remove();
				$(".verifiLession").addClass("submit").removeClass("verifiLession");
			},
			repeat_reduce: function(e) {
				var $target = $(e.currentTarget);
				this.changerepeat(0, $target);
			},
			repeat_add: function(e) {
				var $target = $(e.currentTarget);
				this.changerepeat(1, $target);
			},
			changerepeat: function(addOrCut, $target) {
				var $root = $target.parents(".repeatAver"),
					$score = $root.find(".score"),
					// 获取当前分数
					curScore = parseInt($score.attr("data-value"), 10),
					num = parseInt($score.text(), 10);
				if (addOrCut) {
					if (num >= 2) {
						new Piece.Toast(Locale.repeat_tip);
					}
					if (curScore < 3) {
						curScore++;
						$score.attr("data-value", curScore).find("span").text(curScore);
					}
				} else {
					if (curScore > 0) {
						curScore--;
						$score.attr("data-value", curScore).find("span").text(curScore);
					}
				}
			},
			score_reduce: function(e) {
				var $target = $(e.currentTarget);
				this.changeScore(0, $target);
			},
			score_add: function(e) {
				var $target = $(e.currentTarget);
				this.changeScore(1, $target);
			},
			//检测还能输多少字
			wordsTip: function() {
				var wordLen = 200 - $(".mainMsg")[0].value.trim().length;
				var tip = Locale.input + wordLen + Locale.word;
				$('.wordsTip').text(tip);
			},
			changeScore: function(addOrCut, $target) {
				var that = this;
				var probdata = {},
					scoreArrId = 0,
					$root, $parScore, $score, curScore,
					classList, tarClass, parclassList, partarClass,
					$editDiv, $showDiv,
					rtamid, subjectid, rtamName, numRange,
					scoreArrStr,
					warnScore, scoreStand = "";
				$root = $target.parents(".score_item");
				$parScore = $target.parents(".sub_item_detail");
				$score = $parScore.find(".score");
				// 获取当前分数
				curScore = parseInt($score.attr("data-value"), 10);
				classList = $score.attr("class");
				// 当前分数项classlist
				tarClass = "." + classList.split(" ")[1];
				// 当前父类classlist
				parclassList = $target.parent().attr("class");
				partarClass = parclassList.split(" ")[1];
				$editDiv = $target.parents(".editCoreDetail");
				$showDiv = $editDiv.next(".showCoreDetail");
				// 获取分数区间在此区间则改变数字
				subjectid = $root.parents(".sub_item").attr("data-subjectid");
				rtamid = $editDiv.attr("data-rtamid");
				// 获取rtam名称
				rtamName = $editDiv.find(".rtamName").attr("data-name");
				// 获取分数可选择的范围
				numRange = $editDiv.attr("data-scoreranges");
				// 获取分数数组详细信息
				scoreArrStr = $editDiv.attr("data-scorearr");
				// 获取红色项分数
				warnScore = $editDiv.attr("data-warnscore");
				scoreArr = JSON.parse(scoreArrStr);
				// 点击的是重复次数========
				// 点击的是分数============
				if (addOrCut) {
					// 先判断当前分数是否在分数区间不在则再--保证分数不变
					curScore++;
				} else {
					curScore--;
				}
				// 获取分数相用来修改对应的ID
				_.each(scoreArr, function(item, index) {
					if (item.score === parseInt(curScore, 10)) {
						scoreArrId = item.scoreId;
						scoreStand = item.remark;
					}
				});
				// 如果分数在给定的分数区间修改分数
				if (numRange.indexOf(curScore) > -1) {
					// 如果点击的为成绩评定分数
					if (partarClass == "scoreItem") {
						// 提示评分标准
						if (scoreStand) {
							new Piece.Toast(scoreStand);
						}
						$showDiv.find(tarClass).find("span").attr("id", "");
						$score.attr("data-value", curScore).find("span").text(curScore);
						$score.attr("data-scoreid", scoreArrId);
						$showDiv.find(".scoreValue").attr("data-scoreid", scoreArrId);
						// 如果是红色相则高亮
						if (warnScore == curScore) {
							$showDiv.find(".scoreValue").find("span").addClass("lhscore");
						} else {
							$showDiv.find(".scoreValue").find("span").removeClass("lhscore");
						}
					} else {
						// 点击预估分数
						$score.attr("data-value", curScore).find("span").text(curScore);
						$score.attr("data-estimate", scoreArrId);
						$showDiv.find(".estimate").attr("data-estimate", scoreArrId);
					}
					// 获取不可编辑下的相同类名的字段设置其值
					$showDiv.find(tarClass).attr("data-value", curScore).find("span").text(curScore);
					if (curScore == "4" || curScore == "5") {
						if (partarClass == "estimateItem") {
							// 只有预评估分=4或5的时候，就自动给评分=4或5，但是评分为4或者5分时，不需要将预估分变为4或5.
							that.checkIfAsycScore($root, curScore, scoreArrId, partarClass);
						}

					}
				}
				// 计算平均分
				this.calculateAverageScore();
			},
			// 当预评估分=4或5的时候，就自动给评分=4或5同时改变不能编辑的数据状态
			checkIfAsycScore: function($root, curScore, scoreArrId, partarClass) {
				var $scoreItem;
				var itemScore;
				var scroeType = ".scoreItem";
				// 获取不可编辑的元素以便修改分数
				var $showItem = $root.next();
				$showScoreItem = $showItem.find(".scoreValue");
				var $tar = $root.find(scroeType);
				$scoreItem = $tar.find(".score");
				if ($scoreItem.length < 1) {
					return;
				}
				if (partarClass == "scoreItem") {
					$scoreItem.attr("data-estimate", scoreArrId);
					$showScoreItem.attr("data-estimate", scoreArrId);
				} else if (partarClass == "estimateItem") {
					$scoreItem.attr("data-scoreid", scoreArrId);
					$showScoreItem.attr("data-scoreid", scoreArrId);
				}
				$scoreItem.attr("data-value", curScore).find("span").text(curScore);
				$showScoreItem.attr("data-value", curScore).find("span").text(curScore);
			},
			// 弹出编辑备注
			// 点击颜色值传递参数过来problemValue, dataobj参数为了同步设置存在问题的数组
			// showRemark: function(e) {
			// 获取备注信息
			// var that = this,
			// probdata = {};
			// 如果存在事件说明是点击备注进入否则是选择分数触发
			// $target = $(e.currentTarget);
			// $problem_item = $target.parents('.problem_item');
			// $remarkText = $problem_item.find(".remarkText");
			// var remarkmessage = $problem_item.attr("data-remark");
			// remark = new Remark();
			// remark.show(remarkmessage, that.tip_titile);
			// that.wordsTip();
			// var eventObj = {};
			// eventObj.target = $target;
			// eventObj.$problem_item = $problem_item;
			// eventObj.root = $(".remarkTip");
			// eventObj.remark = remark;
			// eventObj.$remarkText = $remarkText;
			// this.initEvent(eventObj);
			// 点击确认
			// },
			initEvent: function(eventObj) {
				var that = this;
				eventObj.root.on("click", ".remark_confirm", function() {
					// 点击确定保存信息并且关闭弹出框
					var newMessage = $(".mainMsg")[0].value.trim();
					$(".mainMsg")[0].value = newMessage;
					if (newMessage.length < 1) {
						Piece.Toast(Locale.remark_content);
						return;
					}
					if (newMessage.length > 200) {
						new Piece.Toast(Locale.maxLen);
						return;
					}
					eventObj.$problem_item.attr("data-remark", newMessage);
					eventObj.$remarkText.text(newMessage);
					eventObj.remark.hide();
					// 解绑
					eventObj.root.off();
				});
				// 点击取消
				eventObj.root.on("click", ".remark_cancel", function() {
					// 点击确定保存信息并且关闭弹出框
					eventObj.remark.hide();
					// 解绑
					eventObj.root.off();
				});
				// 判断输入字数
				$(".mainMsg").on("input", function() {
					that.wordsTip();
				});
			},
			// 计算平均分数
			calculateAverageScore: function() {
				var that = this;
				var $sub_item = $(".sub_item");
				var estAver = 0,
					scoreAver = 0,
					repeatAver = 0,
					ratmLen = 0;
				_.each($sub_item, function(item, index) {
					$score_item = $(item);
					var estsum = 0,
						scoresum = 0,
						repeatsum = 0;
					_.each($score_item, function(editCore, index) {
						$scoreNum = $(editCore);
						$editCore = $scoreNum.find(".editCoreDetail");
						ratmLen = $editCore.length;
						_.each($editCore, function(scoreNum, index) {
							$scoreNum = $(scoreNum);
							// console.log($scoreNum);
							var reptime = $scoreNum.find(".repeat").attr("data-value") || 0;
							var scoreEsti = $scoreNum.find(".estimate").attr("data-value") || 0;
							var scoreVa = $scoreNum.find(".scoreValue").attr("data-value") || 0;
							estsum += parseInt(scoreEsti, 10);
							scoresum += parseInt(scoreVa, 10);
							repeatsum += parseInt(reptime, 10);
						});
						// 设置rtam项平均分数
						var $averScore = $editCore.parent().prev(".sub_item_title");
						estAver = (estsum / ratmLen).toFixed(1);
						scoreAver = (scoresum / ratmLen).toFixed(1);
						// 不保留小数
						repeatAver = (repeatsum / ratmLen).toFixed(0);
						$averScore.find(".estAver").text(estAver).attr("data-value", estAver);
						$averScore.find(".scoreAver").text(scoreAver).attr("data-value", scoreAver);
						//$averScore.find(".repeatAver").text(repeatAver).attr("data-value", repeatAver);
					});
				});
			},
			handelCore: function(e) {
				var $target = $(e.currentTarget),
					className = $target.attr("class"),
					$parent = $target.parents(".sub_item");
				switch (className) {
					case "showCore":
					case "editCore":
						if (className == "editCore") {
							$parent.find(".repeatAver").find(".editrepeat").show().siblings().hide();
							$parent.find(".editCore").hide();
							$parent.find(".showCore").show();
							$parent.find(".toggleUp").hide();
							$parent.find(".toggleDown").show();
							$parent.find(".itemCantain").show();
						} else if (className == "showCore") {
							$parent.find(".repeatAver").find(".showrepeat").show().siblings().hide();
							$parent.find(".editCore").show();
							$parent.find(".showCore").hide();
							$parent.find(".toggleUp").show();
							$parent.find(".toggleDown").hide();
							$parent.find(".itemCantain").hide();
						}
						$parent.find(".score_item ").addClass("disNone");
						// 展示所需项目
						$parent.find("." + className + "Detail").removeClass("disNone");
						break;
					case "toggleDown":
					case "toggleUp":
						if (className == "toggleDown") {
							$parent.find(".toggleUp").show();
							$parent.find(".toggleDown").hide();
							$parent.find(".itemCantain").hide();
						} else if (className == "toggleUp") {
							$parent.find(".toggleUp").hide();
							$parent.find(".toggleDown").show();
							$parent.find(".itemCantain").show();
						}

						break;
				}
				this.myScroll.refresh();
				// 隐藏所有项目
			},
			// 暂存
			saveData: function(valid) {
				// 获取上传分数数据
				var options = {};
				var datainfo = this.setlocalScore(valid);
				// 如果没有通过验证则返回
				if (!datainfo) {
					return;
				}
				options.scoreInfo = datainfo.scoreInfo;
				// 继承默认参数对象
				if ($(".otherinfo_text")[0]) {
					var otherInfo = $(".otherinfo_text")[0].value;
					this.baseParams.otherInfo = otherInfo;
				}
				// 记录结束时间
				var dateEnd = new Date();
				this.baseParams.endTime = DateUtil.dateFormat(dateEnd, "yyyy-MM-dd hh:mm");
				if (valid == 1) {
					this.baseParams.finish = "true";
				}
				options = _.extend(options, this.baseParams);
				// 上传分数参数
				// console.log(this.baseParams);
				// console.log(options);
				// 同步分数到缓存(用来回显)
				var courseData = this.updatelocaldata(options);
				var data = {};
				data.options = options;
				data.courseData = courseData;
				return data;
			},
			setlocalScore: function(valid) {
				var that = this;
				var $sub_list = $(".sub_item");
				// 用来验证第四点
				$(".subjectName").attr("style", "");
				var Validation = true,
					ValidA = true,
					repeatValue,
					datainfo = {};
				// 分数数组
				var scoreInfo = [],
					scoreTestInfo = [];
				_.each($sub_list, function(item, index) {
					// 用来验证第四点
					var ValidsameScore = true;
					// 科目
					var scoreParam = null;
					var subValue = $(item).attr("data-subjectId"),
						checked = $(item).attr("data-checked"),
						repeatValue = $(item).find(".repeatAver").find(".repeat").attr("data-value");
					$sub = $(item).find(".showCoreDetail");
					_.each($sub, function(subitem, subindex) {
						// 检查项
						var $subItem = $(subitem);
						var rtamValue = $subItem.attr("data-rtamId"),
							scoreValue = $subItem.find(".scoreValue").attr("data-value"),
							warnScore = $subItem.attr("data-warnScore"),
							scoreId = $subItem.find(".scoreValue").attr("data-scoreid"),
							estimateValue = $subItem.find(".estimate").attr("data-value"),
							gradeValue = $subItem.find(".estimate").attr("data-estimate");
						// 如果是第二课时或者第三课时预估评分为undefined，默认成""
						if (typeof gradeValue == "undefined" || gradeValue == "none") {
							gradeValue = "";
						}
						// 如果是第1课时或者第3课时预估评分为undefined，默认成""
						if (typeof repeatValue == "undefined") {
							repeatValue = 0;
						}
						scoreParam = {
							"subjectId": subValue,
							"ratmId": rtamValue,
							"estimate": gradeValue,
							"estimateValue": estimateValue || "",
							"scoreId": scoreId,
							"scoreValue": scoreValue,
							"warnScore": warnScore,
							"repeat": repeatValue,
							"checked": checked || ""
						};
						// 如果vaild===1,验证打分信息打分规则如下
						// 1. 含预评估分和评定分数
						// 2. 当成绩评定与评估分不一致，重复次数不能为0，需要>=1
						// 3. 当重复次数=3，提示该操作已重复3次
						// 4. 如果选择与评估分和成绩评定一致，则不记录一次重复次数
						//例如，默认为4分，最后预估=5，评定=5，不记录重复次数
						if (valid === 1) {
							// 如果为第一课程
							if (that.baseParams.lessonNo == 1) {
								if (estimateValue != scoreValue) {
									ValidsameScore = false;
									if (repeatValue == 0) {
										Validation = false;
										$(item).find(".subjectName").css({
											"color": "#f00"
										});
										return;
									}
								}
							}
						}
						scoreTestInfo.push(scoreValue);
						scoreInfo.push(scoreParam);
					});
					if (valid === 1 && that.baseParams.lessonNo == 1) {
						// 用来验证第四点
						if (ValidsameScore && repeatValue > 0) {
							ValidA = false;
							$(item).find(".subjectName").css({
								"color": "#f00"
							});

							return;
						}
					}
				});
				if (valid === 1) {
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
				// 保留验证逻辑
				datainfo.scoreInfo = scoreInfo;
				datainfo.Validation = Validation;
				return datainfo;
			},
			// 同步分数到缓存
			updatelocaldata: function(options, valid) {
				// 取出数据进行对比
				var courseId = this.baseParams.courseId;
				var data = Util.getDownloadCourse(courseId);
				var params = this.baseParams; // 根据参数获取课时信息
				var courseData = data.result.lessons[params.lessonNo - 1];
				courseData = _.extend(courseData, params);
				_.each(courseData.seqs, function(seq_item, index) {
					_.each(seq_item.subjects, function(subject_item, index) {
						_.each(subject_item.ratms, function(ratms_item, index) {
							// 将页面数据与缓存数据对比修改缓存数据
							_.each(options.scoreInfo, function(item, index) {
								// 如果科目ID与检查要素ID都相等，则为缓存数据新增分数字段
								if (subject_item.subjectId == item.subjectId && ratms_item.ratmId == item.ratmId) {
									ratms_item.scoreId = item.scoreId;
									ratms_item.scoreValue = item.scoreValue;
									ratms_item.repeat = item.repeat;
									ratms_item.estimate = item.estimate;
									ratms_item.estimateValue = item.estimateValue;
									ratms_item.warnScore = item.warnScore;
									// 设置重复次数
									subject_item.repeat = item.repeat;
									// 记录是否被点击
									subject_item.checked = item.checked;
								}
							});
						});
					});
				});
				return courseData;
			},
			// 将暂存的分数赋值给当前页面与课程打分页面不同
			renderTemp: function() {
				var that = this;
				var template = $('#resultPage_template').html();
				this.baseParams = Piece.Store.loadObject("baseParams");
				var params = this.baseParams;
				// 获取回显数据
				var data = Util.getLessonInfoFromCacheByType(this.baseParams, Util.CACHE_TYPE_UNFI_4_DISP);
				console.log("课程结果页面数据data-------：");
				console.log(data);
				if (data) {
					data.lang = Locale;
					var webSite = _.template(template, data);
					$('#scroller').append(webSite);
					// 计算平均分
					that.calculateAverageScore();
					this.myScroll = new iScroll('wrapper', {
						hScroll: false,
						checkDOMChanges: true
					});
				} else {
					Util.ResultWarn(that.el, Locale.nodata);
				}
				this.setHeaderinfo();

				//判断是否有评语
				var comment = Piece.Store.loadObject("cache_comment");
				if (comment) {
					// 关闭可编辑状态
					that.closeEditPic();
					//渲染评语页
					that.renderAfterUploadScore(comment);
					//去掉返回按钮
					that.removeBackIcon();
					// 去掉暂存按钮
					that.removeZanchu();
					//去掉分数编辑图标
					that.removeEditPic();
					//填写评语
					var cache = Piece.Store.loadObject("cache_otherinfo");
					if (cache) {
						$(".otherinfo_text").val(cache.info);
						$(".red_problem .problemItems").each(function() {
							var $this = $(this);
							for (var i in cache.remark) {
								if ("red" + $this.attr("data-subjectid") === i) {
									$this.find(".remark-input").val(cache.remark[i]);
									$this.find(".problem-title").attr("data-remark", cache.remark[i]);
								}
							}
						});
						$(".yel_problem .problemItems").each(function() {
							var $this = $(this);
							for (var i in cache.remark) {
								if ("yel" + $this.attr("data-subjectid") === i) {
									$this.find(".remark-input").val(cache.remark[i]);
									$this.find(".problem-title").attr("data-remark", cache.remark[i]);
								}
							}
						});
						if (cache.pass) {
							$("input[name='pass']").each(function() {
								if (this.value === cache.pass) {
									this.checked = true;
								}
							});
						}
					}
					//填写八大能力项
					var abilityData = {
						result: comment.succResult[0].resultData.result.ability
					};
					template = $('#advan_checked_item_template').html();
					templateHtml = _.template(template, abilityData);
					$(".advan-checked-list").html("");
					$(".advan-checked-list").html(templateHtml);
					this.myScroll.refresh();
				}
			},
			// 课程总结
			renderAfterUploadScore: function(data) {
				// var data = this.LocaleData;
				var renderData = data.succResult[0].resultData;
				renderData.lang = Locale;
				renderData.lessonNo = this.baseParams.lessonNo;
				// 设置
				this.localAbility = null;
				this.localAbility = this.getlocalAbilityArr(renderData);
				var afterUploadScore = $('#afterUploadScore_template').html();
				var protem = _.template(afterUploadScore, renderData);
				var scrollUp = 30 - document.getElementById("scroller").offsetHeight;
				$('#afterUploadScore').html("");
				$('#afterUploadScore').append(protem);
				this.myScroll.refresh();
				this.myScroll.scrollTo(0, scrollUp, 1000);
			},
			// 初始化数组
			getlocalAbilityArr: function(data) {
				// 获取初始化待提升能力数组上传数据
				var that = this;
				var ability = data.result.ability;
				ability.forEach(function(item, index) {
					item.check = item.check || false;
					var children = item.children.forEach(function(child, index) {
						child.check = child.check || false;
					});
				});
				return ability;

			},
			chooseWarnItem: function(e) {
				var that, $target,
					itemValuesObj,
					that = this;
				$target = $(e.currentTarget);
				itemValuesObj = JSON.parse($target.attr("data-value"));
				var data = {};
				data.result = itemValuesObj;
				that.showWarnItemDailog(data);
			},
			showWarnItemDailog: function(data) {
				var that = this;
				var template = $('#disadvantageItem_template').html();
				var webSite = _.template(template, data);
				$(".advan-dailog").find(".advan-content").append(webSite);
				$(".advan-dailog").show();
				that.globalMasker.show();
				that.initDailogIscroll();
			},
			initDailogIscroll: function() {
				var that = this;
				this.dailogIscroll = new iScroll('advan-item-wrapper', {
					hScroll: false,
					checkDOMChanges: true
				});
			},
			advanCancelHandler: function() {
				this.hideWarnItemDailog();
			},
			advanCanfirmHandler: function() {
				var that = this,
					data = {};
				var template, templateHtml;
				// 获取选中的列表
				var hasChecked = this.getCheckItem();
				if (!hasChecked) {
					new Piece.Toast("请选择待提升项目");
					return
				}
				data.result = that.localAbility;
				//修改暂存的八大能力项
				var cacheData = Piece.Store.loadObject("cache_comment", data);
				cacheData.succResult[0].resultData.result.ability = data.result;
				Piece.Store.saveObject("cache_comment", cacheData);

				template = $('#advan_checked_item_template').html();
				templateHtml = _.template(template, data);
				$(".advan-checked-list").html("");
				$(".advan-checked-list").html(templateHtml);
				this.hideWarnItemDailog();
				this.myScroll.refresh();
			},
			// 标识选中的项目并且同步到待提升能力数组
			getCheckItem: function() {
				var that = this;
				var $advanList, $inputs;
				var hasChecked = false;
				$advanList = $(".advan-item-list");
				$inputs = $advanList.find("input");
				abilityIdObj = JSON.parse($advanList.attr("data-value"));
				var abilityId = abilityIdObj.abilityId;
				var passed = abilityIdObj.passed;
				// 新构造的数组用来替换原始数组
				var children = [];
				_.each($inputs, function(item, index) {
					var itemId = $(item).parents(".advan-item").attr("data-abilityid");
					var abilityIdItem = {};
					abilityIdItem.abilityId = itemId;
					abilityIdItem.name = item.value;
					abilityIdItem.check = !!item.checked;
					children.push(abilityIdItem);
					// 如果有一个子项呗选中了，则标记整个被选中
					if (item.checked) {
						hasChecked = true;
					}
				});
				_.each(that.localAbility, function(item, index) {
					if (item.abilityId == abilityId) {
						// 根据子项有一个被选中则这个项目就被选中了
						var li = $(".advan-list li")[index];
						item.check = hasChecked
						item.children = children;
						li.setAttribute("data-value", JSON.stringify(item));
						if (hasChecked) {
							$(li).addClass("has-checked");
						} else {
							$(li).removeClass("has-checked");
						}
					}
				});
				return hasChecked || passed;
			},
			hideWarnItemDailog: function() {
				var that = this;
				$(".advan-dailog").find(".advan-content").html("")
				$(".advan-dailog").hide();
				$(".remarkTip").hide();
				this.globalMasker.hide();

				$(".uploadTip").hide();
				$(".uploadTip2").hide();
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
					// studentInfo.studentSeat = Params.studentSeat || "";
					studentInfo.studentId = Params.studentId || "";
					studentInfo.pnf = Params.pnf || "";
					courseInfoText = [courseInfo.courseYear + Locale.year,
						courseInfo.courseYearperiod,
						courseInfo.actype + Locale.acType,
						courseInfo.courseType + Locale.course,
						Locale.the + courseInfo.lessonNo + Locale.lesson,
						"(" + courseInfo.lessonType + ")"
					].join("");
					studentInfoText = ["PF：" + studentInfo.studentId,
						"(" + stuSeat + ")",
						" | ",
						"PNF：" + studentInfo.pnf
					].join("");
				}
				$(".courseInfo").text(courseInfoText);
				$(".rightTop").text(studentInfoText);
			},
			otherinfoChange: function() {
				var cache = Piece.Store.loadObject("cache_otherinfo") || {};
				cache.info = $(".otherinfo_text").val();
				Piece.Store.saveObject("cache_otherinfo", cache);
			},
			passChange: function() {
				var cache = Piece.Store.loadObject("cache_otherinfo") || {};
				cache.pass = $("input[name='pass']:checked").val();
				Piece.Store.saveObject("cache_otherinfo", cache);
			},
			onShow: function() {
				console.log('进入课程结果页面');
				//write your business logic here :)
				var that = this;
				that.renderTemp();
				that.globalMasker = $(".masker");
			}
		}); //view define

	});