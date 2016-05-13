define(['text!com.ebt.editGroup/chooseaddrgroup.html',"text!com.ebt.editGroup/template/chooseaddrgroup_template.html",
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource',
		"../base/date"],
	function(viewTemplate,viewTemplatecontent, Util, openApi, baseLocale, DateUtil) {
		var temp,action;
		var place,batch;
		return Piece.View.extend({
			id: 'com.ebt.editGroup_chooseaddrgroup',
			events:{
				
				'click .back': 'return',
				'click .ca_items li': "stationCodes",
				'click .cg_edit':'goeditgroup',
				'click .bg_item':'choosegroup',
				'click .startLession': "startLession"
				
				
			},
			return: function() {
				window.history.go(-1);
				var that = this;
				if(that.teachName.length>0){
					that.teachName =[];
				}
			},
		    goeditgroup:function(){
		    	var that=this;
		        var courseId=Util.request("courseId");
		        var batchId=Util.request("batchId");
			    var trainId=Util.request("trainId");
			    var type=Util.request("type");
                var url="editgroup?batchId="+batchId+"&courseId="+courseId+"&trainId="+trainId+"&type="+type;
				that.navigate(url, {
						trigger: true
				});
		    },
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+viewTemplatecontent;

				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			
			
			stationCodes: function(e) {
				
				
				$target = $(e.currentTarget);
				// 修改菜单栏样式
				$target.toggleClass('actives').siblings().removeClass('actives');
			},
			choosegroup:function(e){
               $target = $(e.currentTarget);
               $target.toggleClass('activeg').parents('li').siblings('li').find('.bg_item').removeClass('activeg');

			},
			startLession: function() {
				var that=this;
				var stuCount=$(".activeg").attr("data-stuCount");
				var finishCount=$(".activeg").attr("data-finishCount");

				if($('.actives').length>0&&$('.activeg').length>0&&stuCount!=finishCount){
					var chooseinfo={};
					var group={};
                    var stationCodes=JSON.parse($.trim($('.actives').attr("data-stationcodes")));
				    var students=JSON.parse($.trim($('.activeg').attr("data-value")));
				    var groupId=$.trim($('.activeg').attr("data-groupId"));
				    var groupName=$('.activeg').attr("data-groupName");
				    var actype=$('.activeg').attr("data-actype");
				    
				    // chooseinfo.stationCodes=stationCodes;
				    // chooseinfo.students=students;
				    // chooseinfo.groupId=groupId;

				    chooseinfo.groups=[];
					group.groupIndex=$('.activeg').attr("data-index");
				    group.groupId=groupId;
				    group.groupName=groupName;
				    group.students=students;
				    group.stationCodes=stationCodes;
				    group.status=$('.activeg').attr("data-status");
				    group.actype=actype;
				    chooseinfo.groups.push(group)
				    chooseinfo.trainId=Util.request("trainId");
				    chooseinfo.instructorId=Piece.Session.loadObject(Util.CURRENT_USER_ID);
				    chooseinfo.batchId=Util.request("batchId");
				   	// chooseinfo.actype=actype;
				   	chooseinfo.batchStartTime=Util.request("batchStartTime");
				   	chooseinfo.batchEndTime=Util.request("batchEndTime");
				   	chooseinfo.batchName=decodeURIComponent(Util.request("batchName"));
				   	chooseinfo.trainName=decodeURIComponent(Util.request("trainName"));
				    console.log(chooseinfo);
				    Piece.Session.saveObject("chooseinfo",chooseinfo);
				    var url="com.ebt.course/chooseSkill?actype="+actype+"&groupIndex="+$('.activeg').attr("data-index");
                    that.navigateModule(url,{trigger:true});
				   
				}else if($('.actives').length==0||$('.activeg').length==0){
					new Piece.Toast("请选择地点和分组", 3000);
					return;
				}else if($('.actives').length>0&&$('.activeg').length>0&&stuCount==finishCount){
					new Piece.Toast("该组学员已全部打分，请另选其他分组", 3000);
					return;
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
			
			requestAjax: function(url, param) {
			
				var that = this;
			
				if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
								console.log(data);
								that.getbatchdata(data);
								
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
			},
			getbatchdata:function(data){
				var that=this;
				var batchId=Util.request("batchId");
				var trainId=Util.request("trainId");
				var batchdata=that.filterbatchdata(trainId,batchId,data);
				var lessionData = Piece.Session.loadObject("lessionData");
				batchdata.stationCodes=lessionData.result.stationCodes;
				// batchdata.stationCodes=lessionData.result.stationCodes;
				that.rendergroup(batchdata);

			},
			filterbatchdata:function(trainId,batchId,data){
                var result=data.result;
                var batchitemdata={};
                for(var i=0;i<result.length;i++){
                   if(result[i].trainId==trainId){
                   	  batchitemdata.trainId=result[i].trainId;
                   	  batchitemdata.trainName=result[i].trainName
                   	  batchitemdata.type=result[i].type;
                      for(var j=0;j<result[i].batchs.length;j++){
                      
                         if(result[i].batchs[j].batchId==batchId){

                             batchitemdata.batchs=result[i].batchs[j];
                              break;
                         }
                        
                      }
                      break;
                   }
                }
                return batchitemdata;
			},
			myScroll:null,
			rendergroup:function(data){
				var that=this;
				console.log(data);
				var template = $('#chooseaddrgroup_template').html();
			    var webSite = _.template(template)(data);
				$("#content").html(webSite);
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});}
			
			},
		    
		
			onShow: function() {
				var that=this;
			  	$(".title").text(Piece.Session.loadObject("lessionTitle"))
				that.renderTemp();
			
				//write your business logic here :)
			}
		}); //view define

	});