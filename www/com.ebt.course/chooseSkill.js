define(['text!com.ebt.course/chooseSkill.html', "text!com.ebt.course/template/chooseSkill_template.html", '../base/openapi', '../base/util'],
	function(viewTemplate, chooseSkillsTemp, OpenAPI, Util) {
		var lessionData={};
		return Piece.View.extend({
			id: 'com.ebt.course_chooseSkill',
			events: {
				
				"click .leftTop": "goBack",
				"click .chooseSkill li": "chooseSkill",
				"click .startLession": "startLession"
			},
			//图标显示
            getheight:function(){
                var that=this;
                var height=0;
                
					height=$(".chooseSkillLi").length;
                
                

                if(height>5){
                    $(".tip").show();
                }else{
                	$(".tip").hide();
                }
            },
			goBack: function() {
				window.history.back();
			},
			//技术级别样式
			chooseSkill: function(e) {
				var that = this,
					$target = $(e.currentTarget);
				// 修改菜单栏样式
				$target.removeClass("chooseSkillLi");
				$target.addClass("roleGrolItem").siblings().removeClass("roleGrolItem");
				$target.siblings().addClass("chooseSkillLi");
			},
			myScroll:null,
			renderTemp: function() {
				var that =this;
				var lessionData = Piece.Session.loadObject("lessionData");
				var chooseinfo = Piece.Session.loadObject("chooseinfo");
				var skilldata={};
				var actypes=lessionData.result.actypes;
            	for(var i=0;i<actypes.length;i++){
                   if(actypes[i].actype==Util.request("actype")){
                     skilldata.skills=actypes[i].skills;
                     break;
                   }
            	}
				skilldata.chooseinfo=chooseinfo;	
				console.log(skilldata);	
				var template=me.find("#chooseSkill_template").html();
				
				var sorthtml =_.template(template,skilldata);

				$("#content").html(sorthtml);
				if (that.myScroll) {
					that.myScroll.refresh();
				} else {
					that.myScroll = new iScroll('wrapper', {
						hScroll: false
					});}
				setTimeout(function(){
						that.getheight("");
					},100)
				
			},
			/*
			startLession: function() {
				Piece.Session.deleteObject("stuscroe");
				Piece.Session.deleteObject("savetask");
				var Count = 0;
				$(".roleGrolItem").each(function(index,item){
					Count = Count +1;
				});
				var batch = Piece.Session.loadObject("batch");
				if(Count >0){
					var that=this;
					var url = "../com.ebt.course/chooseSubject";
					var lession = Piece.Session.loadObject("lessionData");
					console.log(lession);
					lessionData.students=[];
					$(".roleGrolItem").each(function(index,item){
						console.log(index,item);
						var object = {};
						object.gId = $(this).attr("data-id");
						object.studentName = $(this).attr("data-stuname");
						lessionData.students.push(object);
						lessionData.students[index].skill =$(this).attr("data-value");
						lessionData.students[index].skillName =$(this).attr("data-name");
						lessionData.students[index].subjects=lession.result.subjects;
					});

					var actype = Piece.Session.loadObject("lessionData");
					actype = actype.result.actype;
					lessionData.actype= actype;
					lessionData.courseId= Piece.Session.loadObject("courseId");
					lessionData.trainId= Piece.Session.loadObject("trainId");
					lessionData.bacthId= Piece.Session.loadObject("batchId");
					lessionData.groupId= Piece.Session.loadObject("groupId");
					lessionData.stationCode= Piece.Session.loadObject("placeId");
					lessionData.stationName= Piece.Session.loadObject("placeName");
					lessionData.subjects = lession.result.subjects;
					lessionData.traimName= Piece.Session.loadObject("GroupName");
					console.log(Piece.Session.loadObject("placeId"));
					//多个教员
					lessionData.instructors= batch.instructors;
					lessionData.instructorId= Piece.Session.loadObject(Util.CURRENT_USER_ID);
					lessionData.instructorName= Piece.Session.loadObject(Util.CURRENT_USER_NAME);
					Piece.Session.saveObject("lession",lessionData);
					
					console.log(Piece.Session.loadObject("lession"));
					console.log(Piece.Session.loadObject("lessionData"));
					that.navigate(url, {
						trigger: true
					});
				}else{
					new Piece.Toast("请选择角色", 3000);
					Count = 0;
				}

			},
			 */
			startLession: function() {
				Piece.Session.deleteObject("stuscroe");
				Piece.Session.deleteObject("savetask");
				var actype=Util.request("actype");
				if($(".roleGrolItem").length >0){
					var that=this;
					var students=[];
					$(".roleGrolItem").each(function(index,item){
						
						var student = {};
						student.studentName = $(this).attr("data-stuname");
						student.gId = $(this).attr("data-id");
						student.studentId = $(this).attr("data-stuId");
						student.skill =$(this).attr("data-value");
						student.skillName =$(this).attr("data-name");
						student.stuIndex =index;
						students.push(student);
						
					});
                    Piece.Session.saveObject("students",students);
					
					 var url="com.ebt.course/chooseSubject?actype="+actype+"&groupIndex="+Util.request("groupIndex");
                     that.navigateModule(url,{trigger:true});
				}else{
					new Piece.Toast("请选择角色", 3000);
				
				}

			},
			render: function() {
				me = $(this.el);
				var viewT =viewTemplate + chooseSkillsTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				var that=this;
				that.renderTemp();
				console.log(Piece.Session.loadObject("lessionTitle"))
				$(".title").html(Piece.Session.loadObject("lessionTitle"))
			}
		}); 
		

	});