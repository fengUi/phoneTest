define(['text!com.ebt.guidedCourse/courseScore.html',"text!com.ebt.guidedCourse/template/unFinishScore_template.html","text!com.ebt.guidedCourse/template/courseScore_template.html",'../base/date', '../base/util'],
	function(viewTemplate,unFinishContent,templateContent, DateUtil,Util) {
		return Piece.View.extend({
			id: 'com.ebt.guidedCourse_courseScore',
			events:{
				'click .Gimg':'Gimg',
				'click .level':'Level',
				"click .score_list li": "chooseSkilledLevel",
				'click .sub_list li':'subClick',
				'click .top-title>img': 'return2',
				'click .endofCourse': 'endofCourse',
				'click .Resultspan': 'Resultspan',
			
				'click .addRemark': 'addRemark',
				'click .cancelRemark': 'cancelRemark',
				"click .cancelBtn":"closedialog",
				//20160302
				"click .jtasTitle":"openJtasDetail",
				"click .Jtascore_list li": "chooseJtaSkilledLevel"
				},
			render: function() {
				me=$(this.el);
				var index=Util.request("itemindex");
				if(index!=""){
					var viewT=viewTemplate+unFinishContent;
				}else{
					var viewT=viewTemplate+templateContent;
				}

				me.html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			//20160302打开任务的详细
			openJtasDetail:function(e){
				var $target = $(e.currentTarget);
				
				if($target.attr("data-subId")==$(".active_"+$target.attr("data-id")+"_"+$target.attr("data-subId")).attr("data-subId")){
					if($(".active_"+$target.attr("data-id")+"_"+$target.attr("data-subId")).css("display")==='none'){
						$(".active_"+$target.attr("data-id")+"_"+$target.attr("data-subId")).show();
						var that = this;
						that.iScroll();
						// that.myScroll.scrollTo(0,0,100,false);
					}else{
						$(".active_"+$target.attr("data-id")+"_"+$target.attr("data-subId")).hide();
					}	
				}
				
				
			},
			chooseJtaSkilledLevel: function(e) {
				var that=this;
				var $target = $(e.currentTarget);
			    
				if($target.hasClass('Jtascore_listActive')){
                  $target.removeClass('Jtascore_listActive');
                  $(".score_listItem").each(function(index,item){
				    	if($(item).attr("data-gid")===$target.attr("data-gid")&&$(item).attr("data-jtaid")===$target.attr("data-jtaid")&&$(item).attr("data-subjectid")===$target.attr("data-subjectid")&&$(item).attr("data-value")===$target.attr("data-value"))
				    	{
							$(item).removeClass('score_listActive');
				    	}
				  })
				}else{
					
					$target.addClass('Jtascore_listActive').siblings('li').removeClass('Jtascore_listActive');
					var score = JSON.parse($target.attr("data-score"));
					
				 	// if($(".active_"+$target.attr("data-jtaid")+"_"+$target.attr("data-subjectid")).css('display')=="none"){
				 		$(".score_listItem").each(function(index,item){
				    	if($(item).attr("data-gid")===$target.attr("data-gid")&&$(item).attr("data-jtaid")===$target.attr("data-jtaid")&&$(item).attr("data-subjectid")===$target.attr("data-subjectid")&&$(item).attr("data-value")===$target.attr("data-value"))
				    	{
							$(item).addClass('score_listActive').siblings('li').removeClass('score_listActive');
				    	}
						})
				 	// }
				    
				}
				
			
			},
			//全局保存暂存分数
			scoreArr:[],
			//保存到待完成
			
			savacompletelesson:function(){
                var that = this;
				var data=Piece.Session.loadObject("lession");
				var EndTime = DateUtil.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
				if(data.groups.length>1&&Util.request("groupIndex")){
					for(var i=0;i<data.groups[Util.request("groupIndex")].students.length;i++){
				    	data.groups[Util.request("groupIndex")].students[i].EndTime = EndTime
				    }
				}else{
					for(var i=0;i<data.groups[0].students.length;i++){
				    	data.groups[0].students[i].EndTime = EndTime
				    }
				}
				Piece.Session.saveObject("lession",data);
				var index =Util.request("itemindex");
				var groupIndex =Util.request("groupIndex");
				var pendkey=Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				// Piece.Store.deleteObject(pendkey)
				var completelesson=Piece.Store.loadObject(pendkey);

				if(index!=""){
				    completelesson[index].groups[groupIndex] = data.groups[groupIndex];
				    Piece.Store.saveObject(pendkey, completelesson);
				}else{
					var complete=[];
					if(!completelesson){
					    complete.push(data);
				     }else{
				     	complete=completelesson;
						if(complete.length==0){
							complete.push(data);
						}else{
						var Count = -1;
						var Count1 = -1;
						var Count2 = -1;
						for(var i=0;i<complete.length;i++){
							if(complete[i].courseName==data.courseName&&complete[i].batchId==data.batchId){
								for(var j=0;j<complete[i].groups.length;j++){
									if(complete[i].groups[j].groupId==data.groups[0].groupId){
										Count1=i
										Count2=j
									}else{
										Count1=i
									}
								}
							}
						}
						if(Count1>=0&&Count2>=0){
							complete[Count1].groups[Count2] = data.groups[0];
						}else if(Count1>=0&&Count2<0){
							complete[Count1].groups.push(data.groups[0]);
						}else{
							complete.push(data)
						}

					   }
					  
				     }
				      console.log(complete)
				      Piece.Store.saveObject(pendkey, complete);
				}
				
			},
			Resultspan:function(){
				var that=this;
				that.getscore();
				that.addstuscore();
				that.savacompletelesson();
				new Piece.Toast("课程暂存成功", 3000);
				var pendkey=Util._getKeyByType(Util.CACHE_TYPE_UNFI);
			},
            endofCourse:function(){

				var that = this;
				that.getscore();
				that.addstuscore();
				that.savacompletelesson();
				var data=Piece.Session.loadObject("lession");
				var stugid=[];
				if(data.groups.length>1&&Util.request("groupIndex")){
					if(data!=null&&data.groups[Util.request("groupIndex")].students.length>0){
						for(var s=0;s<data.groups[Util.request("groupIndex")].students.length;s++){
                   	  		stugid.push(data.groups[Util.request("groupIndex")].students[s].studentId);
                   		}
					}
				}else{
					if(data!=null&&data.groups[0].students.length>0){
                   		for(var s=0;s<data.groups[0].students.length;s++){
                   	  		stugid.push(data.groups[0].students[s].studentId);
                   		}
					}
				}
			    var flag=0;
				var stuscorecount={};
				$('.active').each(function(){
					var stus=$(this).find('.stu_name')
					var len=stus.length;
					if(len>0){
                        stus.each(function(){
                           var count=1;
                           var gid=$(this).attr('data-stuid');
                           var hascore=($(this).find('.score_listActive').length>0)?true:false;
                          
                           if(hascore){
                           
                           	  $(this).css("color","#000"); 
                              if(!stuscorecount[gid]){
                              	stuscorecount[gid]=count;

                              }else{
                              	stuscorecount[gid]=++stuscorecount[gid];
                              }
                           }else{
                           	   $(this).css("color","red"); 
                            	flag++;
                           }
                       })
					}
				})
				console.log(stuscorecount)
				
				var slen=stugid.length;
				var c=0;
				for(var g=0;g<slen;g++){
                    if(stuscorecount[stugid[g]]){
                      c++
                    }
				}
				if(c<slen){
			      new Piece.Toast("请把分数填写完成", 3000);
                  return
				}
				else if(c==slen&&flag>0){
					var dialog=new Piece.Dialog(
						{
							"autoshow":false,
							"target":"body",
							"content":"有组员在个别题目上没打分，确认结束课程?"
						},{
							"configs":[{"title":"确认",
								"eventName":"ok",
							},{"title":"取消",
								"eventName":"cancel",
							}],
							"ok":function(){
								Piece.Session.deleteObject("stuscroe");
								// var EndTime = DateUtil.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
					   			//data.EndTime = EndTime;
					   			if(data.groups.length>1&&Util.request("groupIndex")){
					   				for(var i=0;i<data.groups[Util.request("groupIndex")].students.length;i++){
										data.groups[Util.request("groupIndex")].students[i].status="finish"
									}
					   			}else{
					   				for(var i=0;i<data.groups[0].students.length;i++){
										data.groups[0].students[i].status="finish"
									}
					   			}
								
					            Piece.Session.saveObject("lession",data);
					            if(Util.request("edit")){
									if(Util.request("itemindex")){
					   					var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex")+"&itemindex="+Util.request("itemindex")+"&edit="+Util.request("edit");
									}else{
					   					var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex")+"&edit="+Util.request("edit");
									}
								}else{
									if(Util.request("itemindex")){
					   					var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex")+"&itemindex="+Util.request("itemindex");
									}else{
					   					var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex");
									}
								}
								
								that.navigateModule(url, {
									trigger: true
								});
							},
							"cancel":function(){
								return;
							}
						});
					dialog.show();
                    
				}if(c==slen&&flag==0){
					Piece.Session.deleteObject("stuscroe");
                   
					if(data.groups.length>1&&Util.request("groupIndex")){
					   	for(var i=0;i<data.groups[Util.request("groupIndex")].students.length;i++){
								data.groups[Util.request("groupIndex")].students[i].status="finish"
							}
					}else{
					   	for(var i=0;i<data.groups[0].students.length;i++){
								data.groups[0].students[i].status="finish"
							}
					}
					
					Piece.Session.saveObject("lession",data);
					if(Util.request("edit")){
						if(Util.request("itemindex")){
					   		var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex")+"&itemindex="+Util.request("itemindex")+"&edit="+Util.request("edit");
						}else{
					   		var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex")+"&edit="+Util.request("edit");
						}
					}else{
						if(Util.request("itemindex")){
					   		var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex")+"&itemindex="+Util.request("itemindex");
						}else{
					   		var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex");
						}
					}
				  	
					// var url = 'com.ebt.guidedCourse/editscore?groupIndex='+Util.request("groupIndex");
					this.navigateModule(url, {
						trigger: true
					});
				}
			

			},
			
			//评分等级
			Gimg:function(){
                $('.level').show();
			},
			Level:function(){
				$('.level').hide();
			},
			getTemplate:function(tpl,data){
                return _.template(tpl)(data);
			},
			//关闭弹出框
			closedialog:function(){
				$(".complainDialog").removeAttr("data-value");
				$(".complainDialog").removeAttr("data-type");
				$('.contentText').val("");
				$(".masker").hide();
				$(".complainDialog").hide();
			},
			//给每个学员添加分数
			addstuscore:function(){
			   var that=this;
			   that.clearscroe();
			   var studentId,subjectId,jtaId,cjtaId,score,index;
               var stuscoredata=Piece.Session.loadObject("stuscroe");
               if(stuscoredata){
               	 for(var i=0;i<stuscoredata.length;i++){
 
						studentId=stuscoredata[i].studentId;
						subjectId=stuscoredata[i].subjectId;
						jtaId=stuscoredata[i].jtaId;
						cjtaId=stuscoredata[i].cjtaId;
						score=stuscoredata[i].score;
						index=stuscoredata[i].index;
						that.addscore(studentId,subjectId,jtaId,cjtaId,score,index);

               	 }
               }
               var Jtastuscoredata=Piece.Session.loadObject("Jtastuscroe");
               if(Jtastuscoredata){
               	 for(var i=0;i<Jtastuscoredata.length;i++){
 
						studentId=Jtastuscoredata[i].studentId;
						subjectId=Jtastuscoredata[i].subjectId;
						jtaId=Jtastuscoredata[i].jtaId;
						index=Jtastuscoredata[i].index;
						that.addjtascore(studentId,subjectId,jtaId,index);
               	 }
               }
			},
			clearscroe:function(){
              var data=Piece.Session.loadObject("lession");
           		console.log(data)
           		if(data.groups.length>1&&Util.request("groupIndex")){
					for(var i=0;i<data.groups[Util.request("groupIndex")].students.length;i++){
                 		for(var j=0;j<data.groups[Util.request("groupIndex")].students[i].subjects.length;j++){
                   			for(var k=0;k<data.groups[Util.request("groupIndex")].students[i].subjects[j].jtas.length;k++){
                     			for(var m=0;m<data.groups[Util.request("groupIndex")].students[i].subjects[j].jtas[k].cJtas.length;m++){
                         			if(data.groups[Util.request("groupIndex")].students[i].subjects[j].jtas[k].cJtas[m].score){
                         					delete data.groups[Util.request("groupIndex")].students[i].subjects[j].jtas[k].cJtas[m].score
                         }
                      }  
                    }  
                 }
              }
				}else{
              for(var i=0;i<data.groups[0].students.length;i++){
                 for(var j=0;j<data.groups[0].students[i].subjects.length;j++){
                   for(var k=0;k<data.groups[0].students[i].subjects[j].jtas.length;k++){
                     for(var m=0;m<data.groups[0].students[i].subjects[j].jtas[k].cJtas.length;m++){
                         if(data.groups[0].students[i].subjects[j].jtas[k].cJtas[m].score){
                         	delete data.groups[0].students[i].subjects[j].jtas[k].cJtas[m].score
                         }
                      }  
                    }  
                 }
              }
          }
              Piece.Session.saveObject("lession",data);
			},
			//添加分数到学员
			addscore:function(studentId,subjectId,jtaId,cjtaId,score,value){
			    var setRemark="";
				var data=Piece.Session.loadObject("lession");
				var students=data.groups[0].students
				if(data.groups.length>1&&Util.request("groupIndex")){
					var students=data.groups[Util.request("groupIndex")].students
				}
				
				// console.log(data);

				for(var i=0;i<students.length;i++){
				  if(students[i].studentId==studentId&&students[i].subjects.length>0){
					 for(var j=0;j<students[i].subjects.length;j++){
                       if(students[i].subjects[j].subjectId==subjectId&&students[i].subjects[j].jtas.length>0){
                        for(var k=0;k<students[i].subjects[j].jtas.length;k++){
                         if(students[i].subjects[j].jtas[k].jtaId==jtaId&&students[i].subjects[j].jtas[k].cJtas.length>0){
                           for(m=0;m<students[i].subjects[j].jtas[k].cJtas.length;m++){
                             if(students[i].subjects[j].jtas[k].cJtas[m].cjtaId==cjtaId){
                                students[i].subjects[j].jtas[k].cJtas[m].score = score;
                               
                                 }
                              }

                             }
                          }
                       }
					}
                  }   
					
				}
				
				Piece.Session.saveObject("lession",data);
			},
			//20160308添加JTA分数到学员
			addjtascore:function(gid,subjectId,jtaId,value){
			    var setRemark="";
				var data=Piece.Session.loadObject("lession");
				var students=data.groups[0].students
				if(data.groups.length>1&&Util.request("groupIndex")){
					var students=data.groups[Util.request("groupIndex")].students
				}
				// console.log(data);

				for(var i=0;i<students.length;i++){
				  if(students[i].studentId==gid&&students[i].subjects.length>0){
					 for(var j=0;j<students[i].subjects.length;j++){
                       if(students[i].subjects[j].subjectId==subjectId&&students[i].subjects[j].jtas.length>0){
                        for(var k=0;k<students[i].subjects[j].jtas.length;k++){
                         if(students[i].subjects[j].jtas[k].jtaId==jtaId){
                                students[i].subjects[j].jtas[k].score = value;
                             }
                          }
                       }
					}
                  }   
					
				}
				
				Piece.Session.saveObject("lession",data);
			},
			chooseSkilledLevel: function(e) {
				var that=this;
				var $target = $(e.currentTarget);
			    
				if($target.hasClass('score_listActive')){
                  $target.removeClass('score_listActive');
				}else{
					
					$target.addClass('score_listActive').siblings('li').removeClass('score_listActive');
					var score = JSON.parse($target.attr("data-score"));
					if(score.color)
				    {  
				        $target.attr('id','remarkflag')
						$(".remark").show();
						$(".masker").show();
						
						var remark = score.remark;
						$(".remarkText").val(remark);
				    }
				}
			
			},

			//得到打分的信息
			getscore:function(){
				
				var scroe=[];
				var JtaScroe=[];
                $('.active').each(function(){
					var stus=$(this).find('.stu_name')
					var len=stus.length;
					if(len>0){
						
                        stus.each(function(){
                           var stuscore=$(this).find('.score_listActive');
                           if(stuscore.length>0){
                            var stuscoreitem={};
                             stuscoreitem.studentId=stuscore.attr("data-gid");
					         stuscoreitem.subjectId=stuscore.attr("data-subjectId");
							 stuscoreitem.jtaId=stuscore.attr("data-jtaId");
							 stuscoreitem.cjtaId=stuscore.attr("data-cjtaId");
							 stuscoreitem.index=stuscore.attr("data-value")
							 stuscoreitem.score = JSON.parse(stuscore.attr("data-score"));
                           	 scroe.push(stuscoreitem);
                           }
                       })
					}

				})
				//20160307
				$('.jtas_list').each(function(){
					var JtaStu=$(this).find('.Jtastu_name')
					var len=JtaStu.length;
					if(len>0){
                        JtaStu.each(function(){
                           var stuscore=$(this).find('.Jtascore_listActive');
                           if(stuscore.length>0){
                            var Jtastuscoreitem={};
                             Jtastuscoreitem.studentId=stuscore.attr("data-gid");
					         Jtastuscoreitem.subjectId=stuscore.attr("data-subjectId");
							 Jtastuscoreitem.jtaId=stuscore.attr("data-jtaId");
							 Jtastuscoreitem.index=(parseInt(stuscore.attr("data-value"))+1).toString();
                           	 JtaScroe.push(Jtastuscoreitem);
                           }
                       })
					}
					
				})
				console.log(scroe);
				console.log(JtaScroe);
				Piece.Session.saveObject("Jtastuscroe",JtaScroe);
				Piece.Session.saveObject("stuscroe",scroe);
				
				
			},
			//显示分数
			showscore:function(){
			  var that=this;
		      var stuscoredata=Piece.Session.loadObject("stuscroe");
		      var gid,subjectId,jtaId,cjtaId,index;
		      if(stuscoredata){

		      	  $('.active').each(function(){
					var stus=$(this).find('.stu_name')
					var len=stus.length;
					if(len>0){
						
                        stus.each(function(){
                          gid=$(this).attr("data-stuid");
					      subjectId=$(this).attr("data-subjectId");
						  jtaId=$(this).attr("data-jtaId");
						  cjtaId=$(this).attr("data-cjtaId");
						  index=that.hasstuscore(gid,subjectId,jtaId,cjtaId,stuscoredata);
						   // console.log(index)
						  if(index!=-1){
                            $(this).find('.score_listItem').eq(index).addClass('score_listActive');  
						  }
                          
                       })
					}
				})
		      }
			},
			//判断学员分数是否存在，返回分数索引
			hasstuscore:function(gid,subjectId,jtaId,cjtaId,stuscoredata){
				// console.log(stuscoredata)
			    var count=0;
				for(var i=0;i<stuscoredata.length;i++){
                   if(stuscoredata[i].gid==gid&&stuscoredata[i].subjectId==subjectId&&stuscoredata[i].jtaId==jtaId&&stuscoredata[i].cjtaId==cjtaId){
                      count++
                      return stuscoredata[i].index;
                   }
				}
				if(count==0){
                    return -1;
				}
                  
			},
			
			
			addRemark: function() {
				if($(".remarkText").val()==""||$(".remarkText").val()==null){
					new Piece.Toast("备注不能为空", 3000);
					return;
				}else{
					var score=JSON.parse($('#remarkflag').attr('data-score'));
					score.remark=$(".remarkText").val().replace(/\s+/g,"");
					$('#remarkflag').attr('data-score',JSON.stringify(score));
					$('#remarkflag').removeAttr('id');
					$(".remark").hide();
					$(".masker").hide();
					
				}

			},
			//取消备注
			cancelRemark: function() {
				$(".remark").hide();
			},
			subClick:function(e){
				var that=this;
				$(".sub_list").find("li").removeClass('tActive');
				var $target = $(e.currentTarget);
				$target.addClass('tActive');
				var index=$target.attr("data-index");
				$(".subjectIndex").eq(index-1).hide();
				$(".subjectIndex").eq(index).show();
				$(".subjectIndex").each(function(subjectIndex_index,subjectIndex_item){
					if(index!=subjectIndex_index){
						$(".subjectIndex").eq(subjectIndex_index).hide();
						
					}else{
						$(".subjectIndex").eq(subjectIndex_index).show();
						
					}
				});
				that.iScroll();
				that.myScroll.scrollTo(0,0,100,false);
			},
			data:null,

			renderContent:function(){
			    var that=this;
                var data=Piece.Session.loadObject("lession");
				var index=Util.request("itemindex");
				if(index!=""){
					var tpl=me.find("#unFinishScore_template").html();
					var conhtml=that.getTemplate(tpl,data);
					$("#content").html(conhtml);
					$(".stu_name").each(function(index,item){
						var stuId = $(this).attr("data-stuid");
						var subId = $(this).attr("data-subId");
						var jtaId = $(this).attr("data-jtaId");
						var cjtaId = $(this).attr("data-cjtaId");
						var stuIndex = $(this).attr("data-index");
						for(var i=0;i<data.groups[Util.request("groupIndex")].students[stuIndex].subjects.length;i++){
							if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].subjectId==subId){
								for(var j=0;j<data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas.length;j++){
									if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].jtaId==jtaId){
										for(var k=0;k<data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].cJtas.length;k++){
											if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].cJtas[k].cjtaId==cjtaId){
												if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].cJtas[k].score){
													$(this).find("li").each(function(){
														if($(this).text()==data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].cJtas[k].score.score)
														{
															$(this).addClass('score_listActive');
														}
													})
												}
												
											}
										}
									}
								}
							}
						}
					})
					//20160308
					$(".Jtastu_name").each(function(index,item){
						var stuId = $(this).attr("data-stuid");
						var subId = $(this).attr("data-subjectId");
						var jtaId = $(this).attr("data-jtaId");
						var stuIndex = $(this).attr("data-index");
						for(var i=0;i<data.groups[Util.request("groupIndex")].students[stuIndex].subjects.length;i++){
							if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].subjectId==subId){
								for(var j=0;j<data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas.length;j++){
									if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].jtaId==jtaId){										
												if(data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].score){
													
													$(this).find("li").each(function(){
														
														if($(this).attr("data-score")==data.groups[Util.request("groupIndex")].students[stuIndex].subjects[i].jtas[j].score)
														{
															$(this).addClass('Jtascore_listActive');
														}
													})
												}	
									}
								}
							}
						}
					})
				}else{
					
					var tpl=me.find("#courseScore_template").html();
					var conhtml=that.getTemplate(tpl,data);
					$("#content").html(conhtml);
					that.showscore();
				}
               that.unchoose();

			},
			unchoose:function(){
				
				$('.jtas_list').each(function(){
					var lilen=$(this).find('li').length;
					if(lilen==0){
						$(this).find('h3').addClass('unchoose');
					}
				})
			},
			onShow: function() {
				var that=this;
				var pendkey = Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				var completeLesson=Piece.Store.loadObject(pendkey);
				var index=Util.request("itemindex");
				var groupIndex=0;
				
				if(index!=""){
                  Piece.Session.saveObject("lession",completeLesson[index]);
				}else{
					var data=Piece.Session.loadObject("lession");
					// console.log(data)
				    var startTime=DateUtil.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
				    for(var i=0;i<data.groups[0].students.length;i++){
				    	data.groups[0].students[i].startTime = startTime
				    	data.groups[0].students[i].status="unfinish"
				    }
				    Piece.Session.saveObject("lession",data);
				}
				that.renderContent();
				
					that.iScroll();
					
					   
				 
				
				
			},
			myScroll:null,
			iScroll: function() {
				var that=this;
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {});
					that.myScroll.refresh();
				}
			},
			//导航
			return2: function() {

				var that=this;
				var index=Util.request("itemindex");
				
				if(index==""){
					that.getscore();
				}
				window.history.back();
				
				
			}
		}); //view define

	});