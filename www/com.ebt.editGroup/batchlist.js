define(['text!com.ebt.editGroup/batchlist.html',"text!com.ebt.editGroup/template/batchlist_template.html",
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource'],
	function(viewTemplate, templateContent, Util, openApi, baseLocale) {
		var temp,action;
		return Piece.View.extend({
			id: 'com.ebt.editGroup_batchlist',
			events:{
				'click .groupList':"gogrouplist",
				'click .time': 'return',
				'click .btnAdd': 'addBatch',
				'click .sub_list li': "chooseAsideMenu"
			},
			myScroll: null,
			return: function() {
				window.history.back();
			    
				
			},
			addBatch:function(e){
				var that=this;
				var trainid=$(e.currentTarget).attr('data-trainid');
				var url="addbatch?trainid="+trainid;
				that.navigate(url, {
						trigger: true
				});
			},
			gogrouplist:function(e){
				var that=this;
				var courseId=Util.request("courseId");
				var batchId=$(e.currentTarget).attr('data-batchid');
				var trainId=$(e.currentTarget).attr('data-trainId');
				var instructors=$(e.currentTarget).attr('data-instructors').split(',');
				var current=Piece.Session.loadObject(Util.CURRENT_USER_ID);
				var action=Util.request("action");
				var batchStartTime=$(e.currentTarget).attr('data-batchStartTime');
				var batchEndTime=$(e.currentTarget).attr('data-batchEndTime');
				var batchName=$(e.currentTarget).attr('data-batchName');
				var trainName=$(".sub_active").attr('data-name');
				var type=$(e.currentTarget).attr('data-type');
				var url;
				if(instructors.indexOf(current)!=-1){
					if(action!=""){
						
						 url="editgroup?batchId="+batchId+"&courseId="+courseId+"&trainId="+trainId+"&type="+type;
                     
					}else{

					  	 url="chooseaddrgroup?batchId="+batchId+"&courseId="+courseId+"&trainId="+trainId+"&batchStartTime="+batchStartTime+"&batchEndTime="+batchEndTime+"&batchName="+encodeURIComponent(batchName)+"&trainName="+encodeURIComponent(trainName)+"&type="+type;
					}
					
                   
					that.navigate(url, {
							trigger: true
					}); 
				}else{
					Piece.Toast("教员没有权限进入批次",5000);
						return;
				}
				
			},
			
			render: function() {
				var viewT=viewTemplate+templateContent;
				me=$(this.el);
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			renderbatch:function(data){
			
				var that =this
				var template = $('#batchlist_template').html();
				var webSite = _.template(template)(data);
				console.log(data)
				$("#content").html("");
				$("#content").append(webSite);
				setTimeout(function(){
						that.getheight("");
					},100)

			},
			//图标显示
            getheight:function(trainId){
                var that=this;
                var height=0;
                if(trainId==""){
					height=$(".cjt_list").find("li").length;
                }else{
                	height=$("#cjt_list"+trainId).find("li").length;
                }
                

                if(height>8){
                    $(".tip").show();
                }else{
                	$(".tip").hide();
                }
            },
		
		    requestAjax: function(url, param) {
			
				var that = this;
				var lessionData = Piece.Session.loadObject("lessionData");
				if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
								Piece.Session.saveObject("batchs",data);
								that.renderbatch(data);
								
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
			},
			renderTemp:function(){
				var that=this;
				
				var url = openApi.queryGroup;
				var courseId=Util.request("courseId");
				var param = {
					"courseId":courseId,
					"access_token": Piece.Session.loadObject("accessToken")
				};
				

				that.requestAjax(url, param);
			},
			
			// 左侧菜单栏
			chooseAsideMenu: function(e) {
				var that = this,
					$target = $(e.currentTarget),
					$partarget = $target.parent(),
					trainId = $target.attr("data-value");
				// 修改菜单栏样式
				$partarget.parent().find("li").removeClass("sub_active");
				$target.addClass("sub_active");
				// 根据id展示右边的项目
				$("#cjt_list" + trainId).show().siblings().hide();
				var $currentScro = $("#wrapper");
				if($target.attr("data-index")==0){
					$(".btnAdd").show();
				}else{
					$(".btnAdd").hide();
				}
				setTimeout(function(){
						that.getheight(trainId);
					},100)
				

			},
			
			onShow: function() {
				var that=this;
				$(".title").text(Piece.Session.loadObject("lessionTitle"))
                that.renderTemp();
				//write your business logic here :)
			}
		}); //view define

	});