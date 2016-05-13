define(['text!com.ebt.guidedCourse/batchDetail.html',
		'text!com.ebt.guidedCourse/template/batchDetail_template.html',
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource', ],
	function(viewTemplate, batchDetail_template, Util, openApi, baseLocale) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_batchDetail',
			render: function() {
				var viewTemp = _.template(viewTemplate, {
					lang: baseLocale
				})
				$(this.el).html(viewTemp + batchDetail_template);

				Piece.View.prototype.render.call(this);
				return this;
			},
			ActypeArr: [],
			myScroll: null,

			events: {
						'click .Detail':'ScoreDetail',
                        'click .top-title>img': 'return2',
			},
                  return2: function() {
                        //var url = 'com.ebt.course/allCourse';
                        //this.navigateModule(url, {
                        //    trigger: true
                        //});
                        window.history.back();
                  },
			ScoreDetail:function(e){
                        var resultId = $(e.currentTarget).attr("data-resultId");
                        console.log(resultId)
                        var url = 'com.ebt.completeCourse/lessonDetailScore?resultId='+resultId;
                        this.navigateModule(url, {
                              trigger: true
                        });
                  },
			//刷新
			refresh: function() {
				this.onShow();
			},
			renderTemp: function(data) {
				var template = $('#batchDetail_template').html();
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
			renderBatchListTemp: function() {
				var that = this;
				$('.title').text(baseLocale.guidedCourse);
				var url = openApi.queryFinishedBatchScore;
				var param = {
					"courseId": Util.request("courseId"),
                    "batchName": decodeURIComponent(Util.request("batchName")),
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
				var paramObject = {};
				Util.Ajax(
					//本地数据
					// openApi.guidedCourse_template,
					// null,
					//后台数据
					url,
					param,
					function(xhr, settings) {},
					function(data, text, jqHRX) {
						
						var tempData = {};
						// tempData.Locale = Locale;
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
					},
					null,
					function() {},
					null
					// ,that.paramsObj
				);
				
				
				// tempData.Locale = baseLocale;
				// tempData.result = data.result;
				
				// that.renderTemp(tempData);

			},			
			//滑动
			iScroll: function() {
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {});
				}
			},
			//导航
			return2: function() {
				//var url = 'com.ebt.course/allCourse';
				//this.navigateModule(url, {
				//	trigger: true
				//});
				window.history.back();
			},
			onShow: function() {
				//write your business logic here :)
				var that = this;
				var networkState = navigator.network.connection.type || navigator.connection.type;
				if (Connection.NONE === networkState) {
					new Piece.Toast(baseLocale.network_not_available);
				} else {
					that.renderBatchListTemp();
				}
		
			}
		}); //view define

	});