define(['text!com.ebt.course/flydata.html', "text!com.ebt.course/template/flydata_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource", "i18n!../com.ebt.course/nls/flyLocale"],
	function(viewTemplate, flydataTemp, OpenAPI, Util, baseLocale, flyLocale) {
		var courseId, lessonId;
		return Piece.View.extend({
			id: 'com.ebt.course_flydata',
			events: {
				"click .slide_left": "goBack",
				"click .slide_right": "nextPage"
			},
			goBack: function() {
				window.history.back();
			},
			nextPage: function() {
				var that = this;
				var planId = Util.request("planId") || null;
				var courseId = Util.request("courseId");
				var lessonId = Util.request("lessonId");
				var lessonNo = Util.request("lessonNo");
				var lessonType = decodeURIComponent(Util.request("lessonType"));
				var stuPF = decodeURIComponent(Util.request("stuPF"));
				var stuPNF = decodeURIComponent(Util.request("stuPNF"));
				var startTime = Util.request("startTime");
				var trainTime = Util.request("trainTime");
				var station = Util.request("station");
				var device = decodeURIComponent(Util.request("device"));
				var studentSeat = Util.request("studentSeat");
				var stationCodeValue = decodeURIComponent(Util.request("stationCodeValue"));
				var currentUserRole = Piece.Session.loadObject("roles");
				// if (trainTime) {
				// trainTime = trainTime.replace("-", "/");
				// }

				/*if (_.contains(currentUserRole, 'EBT-INSTRUCTOR-APP')) {
					//教员
					var instructorId = Piece.Session.loadObject("currentUserId");
					Piece.Store.saveObject("baseParams", {
						"planId": planId,
						"instructorId": instructorId,
						"courseId": courseId,
						"lessonId": lessonId,
						"lessonNo": lessonNo,
						"lessonType": lessonType,
						"studentId": stuPF,
						"pnf": stuPNF,
						"device": device,
						"stationCode": station,
						"stationCodeValue": stationCodeValue,
						"startTime": startTime,
						"trainTime": trainTime,
						"studentSeat": studentSeat
					});
				} else {
					//学员
					Piece.Store.saveObject("baseParams", {
						"planId": null,
						"instructorId": stuPNF,
						"courseId": courseId,
						"lessonId": lessonId,
						"lessonNo": lessonNo,
						"lessonType": lessonType,
						"studentId": stuPF,
						"pnf": stuPNF,
						"device": device,
						"stationCode": station,
						"stationCodeValue": stationCodeValue,
						"startTime": startTime,
						"trainTime": trainTime,
						"studentSeat": studentSeat
					});
				}*/

				Piece.Store.saveObject("baseParams", {
					"planId": planId,
					"instructorId": stuPNF,
					"courseId": courseId,
					"lessonId": lessonId,
					"lessonNo": lessonNo,
					"lessonType": lessonType,
					"studentId": stuPF,
					"pnf": stuPNF,
					"device": device,
					"stationCode": station,
					"stationCodeValue": stationCodeValue,
					"startTime": startTime,
					"trainTime": trainTime,
					"studentSeat": studentSeat
				});

				var url = "coursePage";
				that.navigate(url, {
					trigger: true
				});
			},
			requestData: function() {
				var that = this;
				var courseId = Util.request("courseId");
				var data = Util.getDownloadCourse(courseId);
				var lesson = data.result.lessons.filter(function(i) {
					return i.lessonId == lessonId
				})[0];
				data.result.lessonNo = lesson.lessonNo;
				data.result.lessonType = lesson.lessonType;

				if (!Util.isNull(data)) {
					that.renderTemp(data);
				} else {
					new Piece.Toast(baseLocale.request_fail);
				}
			},
			renderTemp: function(data) {
				console.log("template");
				var that = this;
				data.lang = flyLocale;
				var template = me.find("#flydata_template").html();
				var websiteHtml = _.template(template, data);
				$("#content").html("");
				$("#content").append(websiteHtml);
			},
			render: function() {
				//添加模板
				me = $(this.el);
				viewT = viewTemplate + flydataTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				courseId = Util.request("courseId");
				lessonId = Util.request("lessonId");

				var that = this;
				that.requestData();

				if ($(".flydataTop").height() > 92) {
					$(".flydataTop_l_r_bottom").addClass('addBorderBottom');
				}
				if ($("#scroller").height() > 648) {
					var myScroll = new iScroll('wrapper', {
						hScroll: false
					});
				}
			}
		}); //by sqhom

	});