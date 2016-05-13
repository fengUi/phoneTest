define(['text!com.ebt.course/chooseSubject.html', "text!com.ebt.course/template/chooseSubject_template.html", '../base/openapi', '../base/util'],
	function(viewTemplate, chooseSubjectTemp, OpenAPI, Util) {
		
		return Piece.View.extend({
			id: 'com.ebt.course_chooseSubject',
			events: {
				"click .time_item": "beginCourse",
				"click .leftTop": "goBack",
				"click .chooseSkill li": "chooseSkill",
				"click .startLession": "startLession",
				"click .cjta_list li":"chooserandom"
			},
			
			goBack: function() {
				window.history.back();
			},
			
			getdata:function(){
				var savetask={};
				var subid=[];
				$('.chooseSkill li').each(function(){
                    if($(this).hasClass('roleGrolItem')){
                      subid.push($(this).attr("data-id"))
                    }
				})
				var	task=[];
				
				$(".task_list .task_item").each(function(){
					var list=$(this).find(".cjta_list");
					var taskitem={};
					taskitem.subjectId=list.attr("data-subjectId");
					var cJtaids=[];
					list.find("li").each(function(){
						if($(this).hasClass("active")){
                            cJtaids.push($(this).attr("data-cjtaId"))
						}
					})

					taskitem.cJtaids=cJtaids;

					task.push(taskitem);
				})

				savetask.subject=subid;
                savetask.task=task;
				return savetask;
			},
			chooserandom:function(e){
				var that=this;
                 var $item=$(e.currentTarget);
                
                 var opt=$item.attr("data-opt");
                if($item.hasClass("active")){
                      	$item.removeClass("active");
                 }else{
                 	 if(opt==0){
                        $item.addClass("active").siblings().removeClass("active");
                    }else if(opt==1){
                    	$item.addClass("active");
                    }
                 }
                  
               

			},
			//技术级别样式
			subject:[],

			chooseSkill: function(e) {
				var that = this,
					$target = $(e.currentTarget),
					data = Piece.Session.loadObject("lessionData");
				var index=$target.index();
			
				// 修改菜单栏样式
				if($target.hasClass("roleGrolItem")){
					$(".task_list .task_item").eq(index).find('.cjta_list li').removeClass('active');
                    $(".task_list .task_item").eq(index).hide();

					$target.removeClass("roleGrolItem");

				    for(var i=0;i<that.subject.length;i++){
						if($target.attr("data-id")==that.subject[i].subjectId){
							that.subject.splice(i,1);
						}
					}
				}else{
					$target.addClass("roleGrolItem");
				    $(".task_list .task_item").eq(index).show();
					// console.log(($target.attr("data-index")))
					that.subject.push(that.data.subjects[$target.attr("data-index")]);
				}
				that.subject = that.subject.sort(function(x,y){
					return x.subjectId - y.subjectId;
				})
				console.log(that.subject)
				that.myScroll.refresh();
			
			},
			myScroll:null,
			
			resetrender:function(){
				
				var that=this;
				var savetask=Piece.Session.loadObject("savetask");
			    console.log(savetask);
				if(savetask!=null){
                  $('.cjta_list').each(function(){
                  	  var subjectid=$(this).attr('data-subjectid');

                  	  $(this).find('li').each(function(){

                  	  	 var cjtaid=$(this).attr('data-cjtaid');
                  	    
                  	  	 if(that.hastask(subjectid,cjtaid,savetask.task)){

                            $(this).addClass('active');
                  	  	 }
                  	  })

                  })

                 $('.chooseSkill li').each(function(){
                  	  var id=$.trim($(this).attr('data-id'));
                  	  var index=$(this).index();
                  	  var dataindex=$(this).attr("data-index")
                  	  console.log(that.data)
                  	  if(savetask.subject&&savetask.subject.indexOf(id)!=-1){
                  	  	  that.subject.push(that.data.subjects[dataindex]);
                          $(this).addClass('roleGrolItem');
                          $('.task_list .task_item').eq(index).show();
                  	   }
                  })
                 
				}
			},
			
			hastask:function(subjectid,cjtaid,tasks){
				var count=0;

				for(var i=0;i<tasks.length;i++){
                    
					if(tasks[i].subjectId==subjectid&&tasks[i].cJtaids.indexOf(String(cjtaid))!=-1){
                           count++;
					}
				}
				if(count>0){
                  return true;
				}else{
					return false;
				}
				
			},
			getsubject:function(task,subject){
				var that=this;
				var cJtasarr;
				var cJtaids;
			   console.log(subject);
				for(var i=0;i<subject.length;i++){
					
					  for(var t=0;t<task.length;t++){
						if(task[t].subjectId==subject[i].subjectId){
	                       cJtaids=task[t].cJtaids;
	                      
						}
					 }
					
					
					for(var j=0;j<subject[i].jtas.length;j++){
						var random=subject[i].jtas[j].random;
						
						  subject[i].jtas[j].cJtas=that.filtertask(cJtaids,subject[i].jtas[j].cJtas,random);
						
					}
				}
				
			    console.log(subject)
				return subject;
				
			},
			filtertask:function(cJtaids,cJtas,random){
				
			   var newcjtas=[];
			  if(random==0||random==1){
               for(var k=0;k<cJtas.length;k++){
                 console.log(cJtas[k].cjtaId)
                 if(cJtaids.indexOf(String(cJtas[k].cjtaId))!=-1){
                 	 newcjtas.push(cJtas[k])
                   }
                 }
			  }else{
			  	newcjtas=cJtas;
			  }
               
               console.log(newcjtas)
               return newcjtas;
			
              
			},
			getstusubject:function(skill,subjects){
                 var stusubject=[];
                 if(subjects.length>0){
                 	for(var i=0;i<subjects.length;i++){
                 
                 	var stusubitem={
                 		seq:subjects[i].seq,
	                 	subjectId:subjects[i].subjectId,
	                 	subjectName:subjects[i].subjectName
	                 
                 	}
                 	var jtas=[];
                 	if(subjects[i].jtas.length>0){
                 		for(var j=0;j<subjects[i].jtas.length;j++){
                 		var jtasitem={
                 			jtaId:subjects[i].jtas[j].jtaId,
                 			jtaName:subjects[i].jtas[j].jtaName,
                 			order:subjects[i].jtas[j].order
                 		};
                 		var cJtas=[];
                 		if(subjects[i].jtas[j].cJtas.length>0){
                 			for(var c=0;c<subjects[i].jtas[j].cJtas.length;c++){
                 			if(subjects[i].jtas[j].cJtas[c].skills.indexOf(parseInt(skill))!=-1){
                               cJtas.push(subjects[i].jtas[j].cJtas[c]); 
                 			}
                 		 }
                 		}
                 		
                 		jtasitem.cJtas=cJtas;
                 		jtas.push(jtasitem);
                 	}
                 	}
                 	
                 	stusubitem.jtas=jtas;
                 	stusubject.push(stusubitem)
                 	
                  }
                 }
                 
                 console.log(stusubject)
                 return stusubject;
			},
			startLession: function() {
					var that=this;
					
				
					if($(".roleGrolItem").length==0){
						new Piece.Toast("请至少选择一个科目");
						return;
					}
					var taskarr=that.getdata().task
					var subjectdata=that.getsubject(taskarr,that.subject);
					var students = Piece.Session.loadObject("students")
					
					for(var i=0;i<students.length;i++){
						
						students[i].subjects =that.getstusubject(students[i].skill,subjectdata);
					}
				  	// console.log(students)
				  	// console.log(that.data)
				  	// console.log(Piece.Session.loadObject("chooseinfo"))
				  	var chooseinfo = Piece.Session.loadObject("chooseinfo")
				  	var lessionData = Piece.Session.loadObject("lessionData").result
				  	var index = Util.request("groupIndex")
					that.lession={};
					
					
					that.lession.groups=[];
					var group={};
					group.gIndex=Util.request("groupIndex");
					group.stationName=chooseinfo.groups[0].stationCodes.name
					group.stationCode=chooseinfo.groups[0].stationCodes.code
					group.groupId=chooseinfo.groups[0].groupId
					group.groupName=chooseinfo.groups[0].groupName
					group.students=students
					group.stationName=chooseinfo.groups[0].stationCodes.name
					group.actypes=that.data
					group.actypes.subjects=subjectdata

					that.lession.groups=[];
					that.lession.groups.push(group)
					that.lession.trainId=chooseinfo.trainId
					that.lession.trainName=chooseinfo.trainName
					that.lession.instructorId=chooseinfo.instructorId
					that.lession.batchId=chooseinfo.batchId
					that.lession.batchEndTime=chooseinfo.batchEndTime
					that.lession.batchStartTime=chooseinfo.batchStartTime
					that.lession.batchName=chooseinfo.batchName

					
					that.lession.courseName=lessionData.courseName;
					that.lession.courseId=lessionData.courseId;
					that.lession.courseType=lessionData.courseType;
					that.lession.courseYear=lessionData.courseYear;
					that.lession.courseYearperiod=lessionData.courseYearperiod;
					that.lession.instructorName=lessionData.instructorName;
					that.lession.itemindex=lessionData.itemindex;
					that.lession.maxTimes=lessionData.maxTimes;
					that.lession.referMaterial=lessionData.referMaterial;
					that.lession.remark=lessionData.remark;

					console.log(that.lession)
                    Piece.Session.saveObject("savetask",that.getdata()); 
					Piece.Session.saveObject("lession",that.lession);
                   
					var url = "../com.ebt.guidedCourse/courseScore?groupIndex="+Util.request("groupIndex");
					that.navigate(url, {
						trigger: true
					});
			},
			render: function() {
				me = $(this.el);
				var viewT =viewTemplate + chooseSubjectTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			
            rendersubTemp:function(){
            	var that=this;
            	var actypedata=that.getactypedata();
                that.renderTemp(actypedata)
            },
            getactypedata:function(){
            	var that=this;
            	var actype=Util.request("actype");
            	var actypedata={};
            	var lessionData=Piece.Session.loadObject("lessionData");
            	console.log(lessionData);
            	var actypes=lessionData.result.actypes;
            	for(var i=0;i<actypes.length;i++){
                   if(actypes[i].actype==actype){
                     actypedata.actype=actypes[i];
                     that.data=actypedata.actype
                     console.log(that.data)
                     break;
                   }
            	}
            	return actypedata;
            },
            renderTemp: function(data) {
				var that=this;
				var template=me.find("#chooseSubject_template").html();
				var sorthtml =_.template(template,data);

				$("#content").html(sorthtml);
                that.resetrender();
				that.myScroll=new iScroll('wrapper', {
						hScroll: false
					});

				
			},
			onShow: function() {
				var that=this;
				that.subject=[];
				that.rendersubTemp();
				

				$(".title").html(Piece.Session.loadObject("lessionTitle"))
				
				
				
			}
		});
	});
