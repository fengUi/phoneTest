define(['text!com.ebt.editGroup/editgroup.html',"text!com.ebt.editGroup/template/editgroup_template.html",
		'../base/util', '../base/openapi',
		'i18n!../base/nls/messageResource',
		"../base/date"],
	function(viewTemplate,viewTemplatecontent, Util, openApi, baseLocale, DateUtil) {
		var temp,action;
		var place,batch;
		return Piece.View.extend({
			id: 'com.ebt.editGroup_editgroup',
			
			events:{
				'click .del':'del',
				'click .back': 'return',
				'click .searchTeach': 'searchStudentOrTeach',
				'click .searchStudent': 'searchStudentOrTeach',
				'click .teach_list li':'teachNameList',
				'click .stu_list li':'trainNameList',
				'click .outStudent': "outStudent",
				"click .changeStudent": "changeStudent",
				'click .outGroup': "outGroup",
				"click .changeGroup": "changeGroup",
				'click .addGroup': "addGroup",
				"click .cancelRemark": "cancelRemark",
				"click .cancelRemarkSed": "cancelRemarkSed",
                "click .editRemark": "editRemark",
                "click .addRemark": "addRemark",
                'click .completeBatch': "completeBatch",
                'click .completeGroup': "completeGroup",
                'click .actype_list li': "chooseactype",
                'click .at_list li': "chooseactype",
                 "click .trainDateInputStart": "chooseStartTime",
			    "click .trainDateInputEnd": "chooseEndTime",
                'click .delTeacher':'delteach'
				
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
			chooseactype:function(e){
               $(e.currentTarget).addClass("active").siblings('li').removeClass("active")
			},
            updateBatch:function(param){
            	console.log(param);
            	var that=this;
                if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					
					var url=openApi.updateBatch;
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0) {
								
								window.history.back();
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
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
			completeBatch: function() {
				var that=this;
				var batchId=Util.request("batchId");
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
				var startTime=$(".trainDateInputStart").html();
				if (startTime== "" ||startTime== null) {
						new Piece.Toast("请写开始时间");
						return;
					}
				if (new Date(startTime).formatDate("yyyy-MM-dd") < new Date().formatDate("yyyy-MM-dd")) {
						
						new Piece.Toast("开始时间设置不可小于当前时间");
						return;
					}
				var endTime=$(".trainDateInputEnd").html();
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
				
      
				var param={
					batchId:batchId,
					batchName:batchName,
					startTime:startTime,
					endTime:endTime,
					instructors:instructors,
					
					access_token:Piece.Session.loadObject("accessToken"),
				}
				
				
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
								that.updateBatch(param);
							},
							"cancel":function(){
								return;
							}
						});
					dialog.show();
				}else{
					that.updateBatch(param);
				}
				
			},
			getinstructors:function(){
				var that=this;
			  var teachlist=[];
              if(that.teachName.length>0){
                for(var i=0;i<that.teachName.length;i++){
                	teachlist.push(that.teachName[i].instructorId);
                }
              }
             
              return teachlist.join(",");
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
				var batchs= Piece.Session.loadObject("batchs");
				console.log(batchs);
                var count=0;
                if(batchs!=null){
                  for(var i=0;i<batchs.length;i++){
                	var startTime2=new Date(batchs[i].startTime).formatDate("yyyy-MM-dd");
		            var endTime2=new Date(batchs[i].endTime).formatDate("yyyy-MM-dd");

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
			
			updatestudent:function(groupId,gId,type){
				var that=this;
                if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					var param={
					  groupId:groupId,
					  gId:gId,
					  type:type,
					  access_token:Piece.Session.loadObject("accessToken")
					}
					console.log(param);
					var url=openApi.change;
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0) {
								
								
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
              that.onShow();
			},

			addRemark: function() {
				
				var that=this;
				var newgroupname=$(".secondValue").val();
				var newActype=$(".firstGroup").attr("data-actype");
				var type="";
				if(Util.request("type")!="1"){
					type=2;
				}else{
					type=1
				}
				if(newgroupname==''){
                   return 
				}
                var groupinfo=that.hasgroup(newgroupname);
                if(groupinfo.groupId!=undefined){
                		if(Util.request("type")!=1){
                			var actype="";
                			$('.cg_list li').each(function(){

                  				if(newgroupname==$(this).attr("data-groupName")){
                  					console.log($(this))
                    				actype=$(this).attr("data-actype");
                  				}
               				})
                			if(actype==newActype){
                				var gId=$(".firstGroup").attr("data-gId");
                    			that.updatestudent(groupinfo.groupId,gId,type);
                			}else{
                				new Piece.Toast("学员调组需要相同机型",3000);
                			}
                		}else{
                			var gId=$(".firstGroup").attr("data-gId");

                    		that.updatestudent(groupinfo.groupId,gId,type);
                		}
                		
                    
                }else{
                	new Piece.Toast("组号不存在",3000);
                }
				$(".remark").hide();
				$(".masker").hide();
				$(".secondValue").val("");
				
								
				
				
			},
			updategroup:function(groupId,groupName,actype,type){
              var that=this;
                if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					if(actype=="undefined"){
						var param={
					  groupId:groupId,
					  groupName:groupName,
					  actype:actype,
					  type:type,
					  access_token:Piece.Session.loadObject("accessToken")
					}
					}else{
					  var param={
					  groupId:groupId,
					  groupName:groupName,
					  actype:actype,
					  type:type,
					  access_token:Piece.Session.loadObject("accessToken")
					}
					}
					
					console.log(param);
					var url=openApi.updateGroup;
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0) {
								
								
							}else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
              that.onShow();
			},
			editRemark: function() {
				var that = this;
				var groupId=$(".firstGroup").attr("data-gID");
				var groupName=$(".secondName").val();
                var actype=$('.at_list .active').attr('actype');
    //             var count=0;
    //             $(".bg_actypes").each(function(index,item){
				// 		if($(item).text()==actype&&$('.firstActype').attr('data-actype')!=actype){
				// 			count++;
				// 		}
				// })
    //             if(count>0){
				// 	new Piece.Toast("已有相同机型的分组，请另选择其他机型");
				// 	return;
				// }
                if($('.at_list .active').attr('actype')==undefined){
                	actype=$('.firstActype').attr('data-actype');
                }
                if(groupName.length>3){
					new Piece.Toast("填写组名不可大于3位");
					return;
				}
				if(groupName==""){
					groupName=$(".firstGroup").attr("data-gname")
				}
				if(groupName!=""&&groupName.match(/[\x01-\xFF]*/)==false){
					new Piece.Toast("填写组名不可写中文，英文，字符和空字符");
					return;
				}
				var type="";
				if(Util.request("type")!="1"){
					type=2;
				}else{
					type=1
				}
				that.updategroup(groupId,groupName,actype,type);
				
				
			    $(".remarkGroup").hide();
				$(".masker").hide();
				$(".secondName").val("");
				
			},
			cancelRemarkSed: function() {
				$(".remarkGroup").hide();
				$(".masker").hide();
			},
			cancelRemark: function() {
				$(".remark").hide();
				$(".masker").hide();
			},
			
			newgroup:function(batchId,groupName,actype,studentId){
               var that = this;
				
				if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					var param={
					  batchId:batchId,
					  groupName:groupName,
					  actype:actype,
                      access_token:Piece.Session.loadObject("accessToken")
					}
					console.log(param);
					var url=openApi.newGroup
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
								 if(studentId!=""&&studentId!=undefined&&studentId!=null){
									that.newStudent(data.result.groupId,studentId)
								 }else{
								 	that.onShow();
								 }
								 
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
              
			},
			
			newStudent:function(groupId,studentId){
				var that = this;
                 if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					var param={
						groupId:groupId,
						studentId:studentId,
						access_token:Piece.Session.loadObject("accessToken")
					}
					var url=openApi.newStudent
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0) {
								 that.onShow();
								 
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
			},
			hasgroup:function(groupName){
			   var groupinfo={};
               $('.cg_list li').each(function(){
                  var cgroupName=$(this).attr('data-groupname');
                  
                  if(cgroupName==groupName){
                    groupinfo.groupId=$(this).attr('data-groupId');
                  	return groupinfo;
                  }
               })
               return groupinfo;
			},
			addGroup:function(){
				var that=this;
				var groupName=$(".GroupsCountValue").val();
				var studentId=$(".GroupsStudentValue").attr('data-value');
				var actype=$(".actype_list .active").attr("data-actype");
				
				if($(".GroupsCountValue").val().length>3){
					new Piece.Toast("填写组名不可大于3个字");
					return;
				}
				if(groupName== ""){
					new Piece.Toast("请填写组名");
					return;
				}
				var groupinfo=that.hasgroup(groupName);
				console.log(groupinfo)
				var batchId=Util.request("batchId");

				if(groupinfo.groupId!=undefined){
                   	if($(".GroupsStudentValue").val()==""){
						new Piece.Toast("请填写学生名字");
						return;
					}
                    that.newStudent(groupinfo.groupId,studentId);
				}else{
				    if(actype==undefined||actype=="undefined"){
						new Piece.Toast("请选择机型");
						return;
					}
					if($(".GroupsStudentValue").val()!=""&&studentId==null){
						new Piece.Toast("请先搜索是否有此学生");
						return;
					}
					var groupinfo=that.hasgroup(groupName);
					
					// var count=0;
					// var count1=0;
					// $(".bg_actypes").each(function(index,item){
					// 	if($(item).text()==actype){
					// 		$(".studentName").each(function(index,item){
					// 			if($(item).attr("data-studentId")==studentId){
					// 				count++;
					// 				return;
					// 			}
					// 		})
					// 	}
					// })
					// $(".bg_actypes").each(function(index,item){
					// 	console.log($(item).text())
					// 	if($(item).text()==actype){
					// 		count1++;
					// 		return;
					// 	}
					// })
					// if(count1>0){
					// 	new Piece.Toast("已有相同机型的分组，请另选择还未添加的分组");
					// 	return;
					// }
					// if(count>0){
					// 	new Piece.Toast("同机型其他组已有此学生");
					// 	return;
					// }
                    that.newgroup(batchId,groupName,actype,studentId);
				}
			    
				
				
				
			},
			changeGroup: function(e) {

				$(".remarkGroup").show();
				$(".masker").show();
				var $at_list = $(".at_list");
				$at_list.html("");
				
				var data = Piece.Session.loadObject("lessionData");
				console.log(data)
				if(Util.request("type")!=1){

				$(".firstGroup").html("原组名："+ $(e.currentTarget).attr("data-groupName"));
				$(".firstGroup").attr("data-gId",$(e.currentTarget).attr("data-groupId"));
				$(".firstGroup").attr("data-gName",$(e.currentTarget).attr("data-groupName"));
				$("#newActype").hide();
				$("#oldActype").css("height","0px");
				$(".remarkGroup").css("height","130px");
				$("#newGroupName").css("top","5px");
				$("#chioce").css("top","5px");
				$(".firstActype").attr("data-actype",$(e.currentTarget).attr("data-groupActype"));
				}else{
					for(var j=0;j<data.result.actypes.length;j++){
						var $li;
						
						$li = $("<li/>", {
							text: data.result.actypes[j].actype,
							class: "actypeItem",
							actype:data.result.actypes[j].actype
						});
						$at_list.append($li);
					}
				$(".firstGroup").html("原组名："+ $(e.currentTarget).attr("data-groupName"));
				$(".firstGroup").attr("data-gId",$(e.currentTarget).attr("data-groupId"));
				$(".firstGroup").attr("data-gName",$(e.currentTarget).attr("data-groupName"));
				$(".firstActype").html("原机型："+$(e.currentTarget).attr("data-groupActype"));
				$(".firstActype").attr("data-actype",$(e.currentTarget).attr("data-groupActype"));
				}
					
				
			},
			outGroup:function(e){
				
              var that=this;
              var groupId=$(e.currentTarget).attr('data-groupId');
              that.removeGroup(groupId);

			},
			changeStudent: function(e) {
				$(".remark").show();
				$(".masker").show();
				$(".firstGroup").html("原组号:"+ $(e.currentTarget).attr("data-groupName"));
				$(".firstGroup").attr("data-gId",$(e.currentTarget).attr("data-gId"));
				$(".firstGroup").attr("data-actype",$(e.currentTarget).attr("data-actype"));
			},
			delstu:function(gId,groupId,slen){
               var that=this;
               if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					var param={
						gId:gId,
						access_token:Piece.Session.loadObject("accessToken")
					}
					var url=openApi.removeStudent;
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0) {

								// --slen;
								// if(slen==0){
								// 	that.removeGroup(groupId);
								// }
								new Piece.Toast("成功删除组员");
								
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
				that.onShow();
			},
			removeGroup:function(groupId){
				var that=this;
               if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					var param={
						groupId:groupId,
						access_token:Piece.Session.loadObject("accessToken")
					}
					var url=openApi.removeGroup;
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							if (data && data.result !== null && data.resultCode === 0) {
								
							} else {
								
								
							};
							
							
						},
						null,
						function() {},
						null
						);
				    }
			    that.onShow();
			},
			outStudent:function(e){
				var that=this,
				$target = $(e.currentTarget);
				var gId=$target.attr('data-gId');
				var groupId=$target.attr('data-groupId');
				//var slen=$target.attr('data-slen');
				that.delstu(gId,groupId);
				
				
                

			},
			trainNameList: function(e) {
				var $el = $(e.currentTarget);

				$(".GroupsStudentValue").val($el.attr("data-name") + "(" + $el.attr("data-id") + ") ").attr("data-value", $el.attr("data-id") );
				$el.addClass("selected").siblings('li').removeClass("selected");
				$(".stu_list").hide();
			},
			teachName:[],
			teachNameList: function(e) {
				var that = this;
				var accountId=$(e.currentTarget).attr("data-id");
				var accountName=$(e.currentTarget).attr("data-name");
				var teach = {};
				teach.instructorId = accountId
				teach.instructorName = accountName;
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
			hasteach:function(accountId){
			  var that=this;
			  var count=0;
              if(that.teachName.length>0){
					for(var i=0;i<that.teachName.length;i++) {
						if (accountId == that.teachName[i].instructorId) {
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
			delteach:function(e){
		      var that=this;
              var accountId=$(e.currentTarget).attr('data-accountId');
              for(var i=0;i<that.teachName.length;i++){
              	if(accountId == that.teachName[i].instructorId){
              		that.teachName.splice(i,1);
              		break;
              	}
              }
              $(e.currentTarget).parent().remove();
			},
			
			searchStudentOrTeach:function(e){
				var that = this;
				var name;
				var url=openApi.query_users;
				var type;
				 var param = {
					"companyId":Piece.Session.loadObject("companyId"),
					"access_token":Piece.Session.loadObject("accessToken")
				};
				if($(e.currentTarget).attr("data-value")=="Teach"){
					name =$(".batchTeacher").val();
					type="Teach";
					
				}else{
					name =$(".GroupsStudentValue").val();
					type="Student";
				}
				if (/(^\s+)|(^$)/.test(name)) {
					Piece.Toast("用户姓名不能为空");
					return;
				}else{
					
					param.name=name;
					that.querystuorteach(url,param,type)
				}

			},
			querystuorteach:function(url,param,type){
                var that = this;
                console.log(param);
				if (!Util.checkConnection()) {

					new Piece.Toast(baseLocale.network_not_available);
				} else {
					Util.Ajax(
						url,
						param,
						function(xhr, settings) {},
						function(data, text, jqHRX) {
							
							if (data && data.result !== null && data.resultCode === 0 && data.result.length !== 0) {
								that.querylist(data,type);
								
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
			querylist:function(data,type){
				var str = "";
				var r = data.result;
				
				for (var i = 0; i < r.length; i++) {
						str += "<li data-name='" + r[i].accountName + "' data-id='" + r[i].accountId + "'";
						if (i === 0) {
						str += "class='selected'";
						}
						str += ">" + r[i].accountName + "(" + r[i].accountId + ") " + r[i].companyName + r[i].deptName + "</li>";
					}
				
			
				if(type=='Teach'){
					$(".batchTeacher").val(r[0].accountName + "(" + r[0].accountId + ") ");
					$(".teach_list .t_list").html(str);
					$(".teach_list").show();
                   
				}else{
                    $(".GroupsStudentValue").val(r[0].accountName + "(" + r[0].accountId + ") ").attr("data-value", r[0].accountId);
					$(".stu_list .s_list").html(str);
					$(".stu_list").show();
				}
				
			},
			
			render: function() {
				me=$(this.el);
				var viewT=viewTemplate+viewTemplatecontent;

				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			return: function() {
				window.history.go(-1);
				var that = this;
				if(that.teachName.length>0){
					that.teachName =[];
				}
			},
			completeGroup:function(){
				window.history.go(-1);
				var that = this;
				if(that.teachName.length>0){
					that.teachName =[];
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
                console.log(param);
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
				batchdata.actypes=lessionData.result.actypes;
				that.rendergroup(batchdata);

			},
			filterbatchdata:function(trainId,batchId,data){
				var that=this;
                var result=data.result;
                var batchitemdata={};
                for(var i=0;i<result.length;i++){
                   if(result[i].trainId==trainId){
                      Piece.Session.saveObject("batchs",result[i].batchs);
                   	  batchitemdata.trainId=result[i].trainId;
                   	  batchitemdata.trainName=result[i].trainName
                   	  batchitemdata.type=result[i].type;
                      for(var j=0;j<result[i].batchs.length;j++){
                      
                         if(result[i].batchs[j].batchId==batchId){

                             batchitemdata.batchs=result[i].batchs[j];
                             that.teachName=result[i].batchs[j].instructors;
                             console.log(that.teachName);
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
				var template = $('#editgroup_template').html();
			    var webSite = _.template(template)(data);
				$("#content").html(webSite);

					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					})
				if(Util.request("type")!=1){
					$(".outStudent").hide();
					$(".outGroup").hide();
					$(".edit_group").hide();
					$(".completeBatch").hide();
					$("#itemTeacher").hide();

					var str = $(".batchTeacher").val();
					var length =$(".batchTeacher").val().length;
					str = str.substring(0,length-1);
					
					$(".batchTeacher").val(str);
					
					
				}
			},
		    
		
			onShow: function() {
				var that=this;
			  	$(".title").text(Piece.Session.loadObject("lessionTitle"))
				that.renderTemp();
			
				//write your business logic here :)
			}
		}); //view define

	});