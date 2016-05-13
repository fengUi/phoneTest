define(['text!com.ebt.tools/versionUpdate.html',"../base/components/footer-menu",'i18n!../com.ebt.tools/nls/versionUpdate','../base/openapi','../base/app', '../base/util'],
	function(viewTemplate,Footer,Locale,OpenAPI,App,Util) {

		return Piece.View.extend({
			id: 'com.ebt.tools_versionUpdate',
			events:{
				"click .leftTop":"goBack",
				"click .checkUpdate":"versionUpdate",
				"click .cleanSession":"cleanSession"
			},
			versionUpdate:function(){
				var footer=new Footer;
				footer.checkUpdate();
			},
			goBack:function(){
				window.history.back();
			},
			render: function() {

				var data = {};
				data.lang = Locale;
				data.App = App;
				var viewT= _.template(viewTemplate,data);

				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			getAppParam:function(){
				console.log(App.getIosAppVersion());
				$('.newVersionNum').text();
			},
			cleanSession:function(){
				var dialog=new Piece.Dialog(
					{
						"autoshow":false,
						"target":"body",
						"content":"如果有成功的数据建议先上传。确认清除待上传课程缓存?"
					},{
						"configs":[{"title":"确认",
							"eventName":"ok",
						},{"title":"取消",
							"eventName":"cancel",
						}],
						"ok":function(){
							var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
							Piece.Store.deleteObject(pendkey);
							return;
						},
						"cancel":function(){
							return;
						}
					});
				dialog.show();
			},
			onShow: function() {
				$(".newVersionNum").text();
				//write your business logic here :)
				var that = this;
				// that.getAppParam();
				console.log(Locale);
        
        //计算localStorage使用量
        var count = 0;
        var lsage = window.localStorage;
        var percent;
        for (var i in lsage) {
          count += lsage[i].length;
        }
        percent = ((count / 5000000) * 100).toFixed(2);
        $(".localStorage-name").html("缓存使用率 "+percent+"%");
        $(".localStorage-inner").css({width:percent+"px"});
			}
		}); //view define

	});