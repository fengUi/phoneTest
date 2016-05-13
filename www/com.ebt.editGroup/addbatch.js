define(['text!com.ebt.editGroup/addbatch.html',"text!com.ebt.editGroup/template/addbatch_template.html",
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource',
		"../base/date"],
	function(viewTemplate,viewTemplatecontent, Util, openApi, baseLocale, DateUtil) {
		var temp,action;
		var place,batch;
		return Piece.View.extend({
			id: 'com.ebt.editGroup_addbatch',
			
			events:{
			   'click .time': 'return',
			   'click .teach_list li':'teachNameList',
			   'click .addBatchList': "addBatch",
			   'click .delTeacher':'delteach',
			   "click .trainDateInputStart": "chooseStartTime",
			    "click .trainDateInputEnd": "chooseEndTime",
			   'click .searchTeach': 'searchTeach'
			},
			return: function() {
				window.history.go(-1);
				
			},
			chooseStartTime:function(){
				var that = this;
				var time;
				var courseYear = $('.trainDateInputStart').text();
				cordova.exec(function(obj) {
					time = obj;
					$(".trainDateInputStart").text(time);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [2, courseYear + " 00:00"]);
			},
			chooseEndTime:function(){
				var that = this;
				var time;
				var courseYear = $('.trainDateInputEnd').text();
				cordova.exec(function(obj) {
					time = obj;
					$(".trainDateInputEnd").text(time);
				}, function(e) {
					console.log("Error: " + e);
				}, "DatePlugin", "showDatePickView", [2, courseYear + " 00:00"]);
			},
			delteach:function(e){
		      var that=this;
              var accountId=$(e.currentTarget).attr('data-accountId');
              for(var i=0;i<that.teachName.length;i++){
              	if(accountId == that.teachName[i].accountId){
              		that.teachName.splice(i,1);
              		break;
              	}
              }
              $(e.currentTarget).parent().remove();
			},
			teachName:[],
			hasteach:function(accountId){
			  var that=this;
			  var count=0;
              if(that.teachName.length>0){
					for(var i=0;i<that.teachName.length;i++) {
						if (accountId == that.teachName[i].accountId) {
								count++;						
						}
					}
					if(count>0){
						return true;
					}else{
						return false;
					}
				}
			},
			teachNameList: function(e) {
				var that = this;
				var accountId=$(e.currentTarget).attr("data-id");
				var accountName=$(e.currentTarget).attr("data-name");
				var teach = {};
				teach.accountId = accountId
				teach.accountName = accountName;
                if(that.hasteach(accountId)){
                  
                	Piece.Toast("不许再添加已选择的教员");
                	return;
                }else{
                	var teachhtml='<li>'+accountName+'<img data-accountId='+accountId+' class="delTeacher" src="../base/img/u3341.png"></li>';
                
                	$('.ct_list').append(teachhtml);

                	that.teachName.push(teach);

                }
				
				$(".batchTeacher").val("")
			    $('.teach_list').hide();
			},
			searchTeach:function(e){
				var that = this;
				
				var url=openApi.query_users;
				
				 var param = {
					"companyId":Piece.Session.loadObject("companyId"),
					"access_token":Piece.Session.loadObject("accessToken")
				};
				
				var name =$(".batchTeacher").val();
				
				if (/(^\s+)|(^$)/.test(name)) {
					Piece.Toast("用户姓名不能为空");
					return;
				}else{
				
					param.name=name;
					that.queryteach(url,param)
				}

			},
			queryteach:function(url,param){
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
								that.querylist(data);
								
							} else {
								
								Piece.Toast("找不到此成员");
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
			},
			querylist:function(data){
				console.log(data);
				var str = "";
				var r = data.result;
				
				for (var i = 0; i < r.length; i++) {
						str += "<li data-name='" + r[i].accountName + "' data-id='" + r[i].accountId + "'";
						if (i === 0) {
						str += "class='selected'";
						}
						str += ">" + r[i].accountName + "(" + r[i].accountId + ") " + r[i].companyName + r[i].deptName + "</li>";
					}
				
					$(".batchTeacher").val(r[0].accountName + "(" + r[0].accountId + ") ");
					$(".teach_list .t_list").html(str);
					$(".teach_list").show();
				
			},
			dateCross:function(startTime,endTime,startTime2,endTime2){
				var st1=new Date(startTime).getTime();
				var et1=new Date(endTime).getTime();
				var st2=new Date(startTime2).getTime();
				var et2=new Date(endTime2).getTime();
				if(st1>st2 && st1<et2|| et1 >st2 && et1 <et2){
					return true;
				}else{
					return false;
				}
				
			},
			
			hasdateCross:function(startTime,endTime){

				var that=this;
				var batchdata=that.filterbatchdata();
                console.log(batchdata);
                var count=0;
                if(batchdata.batchs!=undefined){
                	for(var i=0;i<batchdata.batchs.length;i++){
                		var startTime2=new Date(batchdata.batchs[i].startTime).formatDate("yyyy-MM-dd");
		            	var endTime2=new Date(batchdata.batchs[i].endTime).formatDate("yyyy-MM-dd");

                		if(that.dateCross(new Date(startTime,endTime,startTime2,endTime2))){
                			count++;
                		};
                	}
                }
                
                if(count>0){
                   return true
                }else{
                	return false;
                }

				
			},
			filterbatchdata:function(){
				var trainId=Util.request("trainid");
				var batchs=Piece.Session.loadObject("batchs");
                var result=batchs.result;
                var batchitemdata={};
                for(var i=0;i<result.length;i++){
                   if(result[i].trainId==trainId){
                   	
                   	  batchitemdata.batchs=result[i].batchs;
                      
                      break;
                   }
                }
                return batchitemdata;
			},
			getinstructors:function(){
				var that=this;
			  var teachlist=[];
              if(that.teachName.length>0){
                for(var i=0;i<that.teachName.length;i++){
                	teachlist.push(that.teachName[i].accountId);
                }
              }
             
              return teachlist.join(",");
			},
			isLegal:function(str){
				if(str >= '0' && str <= '9')return true;
				if(str >= 'a' && str <= 'z')return true;
				if(str >= 'A' && str <= 'Z')return true;
				if(str == '_')return true;
				var reg = /^[\u4e00-\u9fa5]+$/i;
				if (reg.test(str))return true;
				  return false;
			},
			addBatch:function(){

				var that=this;
				

				var batchName=$(".batchName").val();
				if (batchName== "") {
						new Piece.Toast("请填写批次名字");
						return;
					}
				for (i=0; i<batchName.length; i++) {
   					if (!that.isLegal(batchName.charAt(i))){
   						new Piece.Toast("批次名字不允许有特殊符号");
    					return;
   					}
				}	
				var startTime=$(".trainDateInputStart").text();
				// var startTime="2016-04-25";
				if (startTime== "" ||startTime== null) {
						new Piece.Toast("请写开始时间");
						return;
					}
				if (new Date(startTime).formatDate("yyyy-MM-dd") < new Date().formatDate("yyyy-MM-dd")) {
						
						new Piece.Toast("开始时间设置不可小于当前时间");
						return;
					}
				var endTime=$(".trainDateInputEnd").text();
				// var endTime="2016-04-30";
				if (endTime== "" ||endTime== null) {
						new Piece.Toast("请写结束时间");
						return;
					}

				if (new Date(endTime).formatDate("yyyy-MM-dd") < new Date().formatDate("yyyy-MM-dd")) {
						
						new Piece.Toast("结束时间设置不可小于当前时间");
						return;
					}
				if (new Date(startTime).formatDate("yyyy-MM-dd") > new Date(endTime).formatDate("yyyy-MM-dd") ) {
						
						new Piece.Toast("结束时间设置不可小于开始时间");
						return;
					}
				var instructors=that.getinstructors();
				
				if (instructors=="") {
					
						new Piece.Toast("请填写教员名字");
						return;
					}
				var trainid=Util.request("trainid");

				var param={
					trainId:trainid,
					batchName:batchName,
					startTime:startTime,
					endTime:endTime,
					instructors:instructors,
					trainid:trainid,
					access_token:Piece.Session.loadObject("accessToken"),
				}
				console.log(param);
				
				var url=openApi.newBatch;
				
				if(that.hasdateCross(startTime,endTime)){
					var dialog=new Piece.Dialog(
						{
							"autoshow":false,
							"target":"body",
							"content":"此批次的开始日期和结束日期前与已有批次日期有交叉?"
						},{
							"configs":[{"title":"确认",
								"eventName":"ok",
							},{"title":"取消",
								"eventName":"cancel",
							}],
							"ok":function(){
								that.requestAjax(url,param);
							},
							"cancel":function(){
								return;
							}
						});
					dialog.show();
				}else{
					that.requestAjax(url,param);
				}
		
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
								
								Piece.Toast("添加成功", 5000);
								window.history.go(-1)
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
			},
		    render: function() {
				me=$(this.el);
				var viewT=viewTemplate+viewTemplatecontent;

				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			renderTemp:function(){
				var that=this;
				
				var template = $('#addbatch_template').html();
			    var webSite = _.template(template)();
				$("#content").html(webSite);
				
			
			},
			onShow: function() {
				var that=this;
			  	that.teachName=[];
				that.renderTemp();
				
			
				//write your business logic here :)
			}
		}); //view define

	});