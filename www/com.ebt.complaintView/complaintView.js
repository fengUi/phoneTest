define(['text!com.ebt.complaintView/complaintView.html', "text!com.ebt.complaintView/template/complaintItem_template.html", '../base/openapi', '../base/util','../base/idangerous.swiper-2.1.min','i18n!../base/nls/messageResource','i18n!../com.ebt.complaintView/nls/complaintView'],
	function(viewTemplate, complaintItemTemp, OpenAPI, Util,swiper,baseLocale,Locale) {
		return Piece.View.extend({
			id: 'com.ebt.complaintView_complaintView',
			events: {
				"click .complaintItem": "showdialog",
				"click .dialogdel": "closedialog",
				"click .top-title>img": "returnBack"
			},

			// paramsObj: {
			// 	cacheId: "complaintView_complaintView",
			// 	isReloadRequest: false
			// 	//若要每次都从网上请求数据，这样设置
			// 	/*isReloadRequest: true*/
			// },

			//引导页左右滑动
			swiper:function(){
				var complaintItem = $('.complaintItem');
				//console.log(complaintItem);
				var compLength = complaintItem.length;
				var divLength = Math.ceil(compLength/3);
				if($('.swiper-wrapper>.complaintItem')[0]){
					for(var i = 0;i<divLength;i++){
					var oDiv = document.createElement('div');
					oDiv.className = 'swiper-slide';
					oDiv.style.float ='left';
					for(var j = 1;j<=3;j++){
						if($('.swiper-wrapper>.complaintItem')[0]){	
							oDiv.appendChild($('.complaintItem')[0]);
							//console.log(complaintItem[0],$('.complaintItem')[0]);
						}
					}
					$('.swiper-wrapper').append(oDiv);
					$('.swiper-wrapper').css('width',600*divLength+'px!important;');	
					}
				}
				var mySwiper = new Swiper('.swiper-container',{
				    pagination: '.pagination',
				    paginationClickable: true
				  })
				  var width =  $('.swiper-pagination-switch').length*($('.swiper-pagination-switch').width()+22);
				  $('.pagination').width(width);
			},
			//返回主页
			returnBack:function(){
				this.navigateModule('com.ebt.course/allCourse',{
					trigger:true
				})
			},
			//显示申诉内容框
			showdialog: function(e) {
				//var that = this;
				$target = $(e.currentTarget);
				console.log($target);
			    itemId = $target.attr('id');
			    $(".masker").show();
			    $('.dialogList').show();
				$(".dialog"+"#dialog"+itemId).show();
			},
			//隐藏申诉内容框
			closedialog: function() {	
				$('.dialogList').hide();
				$("#dialog"+itemId).hide();
				$(".masker").hide();
			},
			//渲染模板，请求数据
			requestData: function() {
				
				var that = this;
				
				var params = {
					"studentId": Piece.Session.loadObject("currentUserId"),
					"access_token": Piece.Session.loadObject("accessToken")
				};
				var url=OpenAPI.queryFeedbacks
				Util.Ajax(
					url,					
					params,
					function(xhr, settings) {},
					function(data, textStatus, jqXHR) {
						
						if(data && data.result !== null && data.resultCode === 0 && data.result.length !== 0){
							console.log(data)
							data.lang = Locale;
							that.renderTemp(data);
							that.swiper();
						}
						else{
							
							Util.ResultWarn(document.body,baseLocale.no_data);
						}
					},
					null,
					function(){},
					null
					// that.paramsObj  
				);
			},
			renderTemp: function(data) {
		
				data.lang=Locale;
				var template = me.find("#complaintItem_template").html();
				var temp = me.find("#complaintdialog_template").html();
				//console.log(template);
				var websiteHtml = _.template(template, data);
				var temphtml = _.template(temp, data);
				$(".content").html("");
				$(".content").append(websiteHtml);
				$(".dialogList").html("");
				$(".dialogList").append(temphtml);

			},
			render: function() {
				//添加模板
				var viewTemp = _.template(viewTemplate,{
					lang:Locale
				})
			    me = $(this.el);
				me.html(viewTemp + complaintItemTemp);
				Piece.View.prototype.render.call(this);
				return this;
			},
		
			onShow: function() {
				//write your business logic here :)
				var that = this;

				if(!Util.checkConnection()){
					Piece.Toast(baseLocale.network_not_available);
					
				}
				else{	
				
					that.requestData();
					
					//Util.ResultWarn(document.body,baseLoc.ale.no_data);
				}
			}
		}); //by sqhom

	});