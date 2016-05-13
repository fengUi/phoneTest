define(['text!com.ebt.toBeFinish/editscore.html', "text!com.ebt.toBeFinish/template/editscore_template.html", '../base/openapi', '../base/util', "i18n!../base/nls/messageResource",  "i18n!../com.ebt.toBeFinish/nls/editscore", '../base/date'],
	function(viewTemplate, editscoreTemp, OpenAPI, Util, baseLocale,  Locale, DateUtil) {
		return Piece.View.extend({
			id: 'com.ebt.toBeFinish_editscore',
		
			subject_wrapper: null,
			events: {
				"click .leftTop": "goBack",
				
				"click .sub_list li": "chooseAside",
				"click .backclist":"goallcourse",
				"click .cancelBtn":"closedialog",
				
				"click .subBtn":"savainfo",
				"click .stulist li":"tabstu",
				"click .sub":"submit",
				"change .s_score":"changescore",
				"click .addinfo":"addinfo",
				"click .delinfo":"delinfo",
				"click .save":"savelocal",
				"click .editinfo":"editinfo",
				"click .detail":"detailshow",
				"click .edit":"editshow"
			},
			goallcourse:function(){
				var that=this;
				var url="com.ebt.toBeFinish/toBeFinishBatch";
				that.navigateModule(url,{trigger:true});
			},
			editshow:function(e){
				var $target=$(e.currentTarget);
				$target.parents("h3").siblings(".cjt_list").find(".s_score").show()
               $target.parents("h3").siblings(".cjt_list").find(".c_score").hide()
				
			},
			detailshow:function(e){
				var $target=$(e.currentTarget);
			   $target.parents("h3").siblings(".cjt_list").find(".c_score").show()
               $target.parents("h3").siblings(".cjt_list").find(".s_score").hide()
			},
			
			savelocal:function(){
                var that=this;
				that.meragedata();
               // that.data.status="complete";
                 for(var i=0;i<that.data.groups[Util.request("groupIndex")].students.length;i++){
                	
                    var common=$("#txtcommon"+i).val();
                    var otherInfo=$("#otherInfo"+i).text();
                    that.data.groups[Util.request("groupIndex")].students[i].common=common;
                    that.data.groups[Util.request("groupIndex")].students[i].otherInfo=otherInfo;

                };
			
				var unfikey=Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				var unfilesson=Piece.Store.loadObject(unfikey);
				unfilesson[that.iindex].groups[Util.request("groupIndex")]=that.data.groups[Util.request("groupIndex")];
				Piece.Store.saveObject(unfikey, unfilesson);
				
				new Piece.Toast("课程结果暂存成功");
				
			},
			editinfo:function(e){
				var $target=$(e.currentTarget);
				var otherinfo=$target.attr("data-value");
				$(".complainDialog").attr("data-value",otherinfo);
				$(".complainDialog").attr("data-type","edit");
				var text=$("#"+otherinfo).text();
				$('.contentText').val($.trim(text));
				$(".masker").show();
				$(".complainDialog").show();

			},
			delinfo:function(e){
				var $target=$(e.currentTarget);
				var otherinfo=$target.attr("data-value");
				$("#"+otherinfo).text("");
			},
			addinfo:function(e){
				var $target=$(e.currentTarget);
				var otherinfo=$target.attr("data-value");
				$(".complainDialog").attr("data-value",otherinfo);
				$(".complainDialog").attr("data-type","add");
				$(".masker").show();
				$(".complainDialog").show();
			},
			savainfo:function(){
				var otherinfo=$(".complainDialog").attr("data-value");
				var type=$(".complainDialog").attr("data-type");
				var content=$('.contentText').val();
				var text="";				
				if(type=="edit"){
					$("#"+otherinfo).text("");
				console.log(text)
				}else{
					text=$("#"+otherinfo).text();
				}
			  
				$("#"+otherinfo).text($.trim(text+content));
				$(".complainDialog").removeAttr("data-value");
				$(".complainDialog").removeAttr("data-type");
				$('.contentText').val("");
				$(".masker").hide();
				$(".complainDialog").hide();
			},
			//关闭弹出框
			closedialog:function(){
				$(".complainDialog").removeAttr("data-value");
				$(".complainDialog").removeAttr("data-type");
                $('.contentText').val("");
                $(".masker").hide();
				$(".complainDialog").hide();
			},
			scoreArr:[],
            changescore:function(e){
            	var that=this;
                var $target=$(e.currentTarget);
                $target.siblings(".c_score").text($target.val());
                var sum=parseFloat($target.val());
                var len=1;
                $target.parent().siblings().each(function(){
                     
                	if($.trim($(this).find(".c_score").text()).length){
                        
                		sum+=parseFloat($.trim($(this).find(".c_score").text()));
                       
                	    len++;

                	}
                	
                })
                 $target.parents(".cjt_list").siblings("h3").find(".average").text((sum/len).toFixed(1));
                 $opt=$target.find("option").not(function(){ return !this.selected });
                 var gid=$opt.attr("data-gid");
                 var subjectid=$opt.attr("data-subjectid");
                 var score=JSON.parse($opt.attr("data-score"));
                 var cjtaid=$opt.attr("data-cjtaid");
                 var index=$opt.attr("data-index");
                
                
                if(!that.scoreexist(gid,subjectid,cjtaid,score)){
                	 var scroeitem={};
	                 scroeitem.gid=gid;
	                 scroeitem.subjectid=subjectid;
	                 scroeitem.score=score;
	                 scroeitem.cjtaid=cjtaid;
            		that.scoreArr.push(scroeitem);
            	}else{
            		for(var i=0;i<that.scoreArr.length;i++){
            		if(that.scoreArr[i].gid==gid&&that.scoreArr[i].subjectid==subjectid&&that.scoreArr[i].cjtaid==cjtaid){
            			 that.scoreArr[i].score=score
            		}
            	  }
            	}
                 	 
               
                that.question(subjectid,cjtaid,score,index);

               
            },
            scoreexist:function(gid,subjectid,cjtaid,score){
            	var that=this;
            	var count=0;
            	
            	if(that.scoreArr.length==0){
            		return false;
            	}else{
            		for(var i=0;i<that.scoreArr.length;i++){
            		if(that.scoreArr[i].gid==gid&&that.scoreArr[i].subjectid==subjectid&&that.scoreArr[i].cjtaid==cjtaid){
            			++count;
            			
            		}
            	}
                if(count>0){
                	return true;
                }else{
                	return false;
                }

            	}
            	
            	
            },
            question:function(subjectid,cjtaid,score,index){
            	var that=this;
           
              var item=JSON.parse($(".question").eq(index).attr("data-value"));
        
            	var qtext="";
            	
            	if(!that.hascolor(subjectid,cjtaid,score,item)){
            		if(score.color){
            			var sitem={};
	                    sitem.sid=subjectid;
						sitem.cid=cjtaid;
						sitem.score=score;
	                    
						item.item.push(sitem)
            		}
            		
            	}else{
            		for(var i=0;i<item.item.length;i++){
            			if(item.item[i].sid==subjectid&&item.item[i].cid==cjtaid){
            				if(score.color){
            					item.item[i].score=score;
            				}else{
            					item.item.splice(i,1);
            				}
            			}
                        
            	      }
            	}
            	if(item.item.length>0){
            		for(var i=0;i<item.item.length;i++){
                        qtext+=item.item[i].score.remark;
            		}

            	}
            	 $(".question").eq(index).text(qtext);
            	 $(".question").eq(index).attr("data-value",JSON.stringify(item));
            	

            },
            //是否存在
            hascolor:function(subjectid,cjtaid,score,item){
            	   var count=0;
                   if(item.item.length==0){
                   	return false;
                   }else{
                   	for(var i=0;i<item.item.length;i++){
            			if(item.item[i].sid==subjectid&&item.item[i].cid==cjtaid){
                           count++
            			}
            		}
            		if(count>0){
            			return true;
            		}else{
            			return false;
            		}
                   }

            },
            //存在问题
            qs:function(){
            	$(".question").each(function(){
            		var item=JSON.parse($(this).attr("data-value"));
            		var qtext="";

            		if(item.item.length>0){
            			var remark=[];
            			for(var i=0;i<item.item.length;i++){
            				remark.push(item.item[i].score.remark);
            				
            			}
            			qtext=remark.join(';');
            		}
            		$(this).text(qtext);
            	})
            },
			valid: false,
			
			goBack: function() {
				window.history.back();
			},
			
			myScroll:[],
			renderTemp: function(data) {
				var that=this;
				
				var template = me.find("#editscore_template").html();
				
				var websiteHtml = _.template(template)(data);
				
				$("#content").html("");
				$("#content").append(websiteHtml);
				 $('.u_score').val('');
				that.scrolls('0');
				that.qs();
			},

			hasscroll:function(index){
				var that=this;
			   if(that.myScroll.length==0){
					return false;
				}
               for(var i=0;i<that.myScroll.length;i++){
               	  if(that.myScroll[i].sname==index){
                      return true;

               	  }
               }
               return false;
			},
			scrolls:function(index){
				var that=this;
                 console.log(that.myScroll); 
				if(that.hasscroll(index)){
				
					for(var h=0;h<that.myScroll.length;h++){
               	       if(that.myScroll[h].sname==index){
                       
                           that.myScroll[h].iScroll.refresh();
                           that.myScroll[h].iScroll.scrollTo(0,0,100,false);
                           break;
				       }
				  }
                    
				}else{
					
					var sc={
					   sname:index,
					 };
	               	var scroll="myScroll"+index;
					scroll=new iScroll('wrapper'+index, {
							      hScroll: false
						       });
					sc.iScroll=scroll;
					that.myScroll.push(sc)
				}
				
			
			    console.log(that.myScroll);
			   
				
			},
			render: function() {
				//添加模板
				me = $(this.el);
				var viewTemp=_.template(viewTemplate,{lang:Locale})
				var viewT =viewTemp + editscoreTemp;
				me.html(viewT);
				Piece.View.prototype.render.call(this);
				return this;
			},
			onShow: function() {
				//write your business logic here :)
				
				var that = this;
				that.myScroll=[];
			
				that.renderDetailTemp();
			
					            
				
			},
			data:null,
            iindex:0,
			renderDetailTemp:function(){
				var that=this;
			
				that.iindex=Util.request("itemindex");
				var unfikey=Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				var unfilesson=Piece.Store.loadObject(unfikey);
				that.data=unfilesson[that.iindex];
				console.log(that.data)
				
				that.renderTemp(that.data);
			
	
			},
			meragedata:function(){
				var that=this;
				if(that.scoreArr.length!=0){
					for(var i=0;i<that.scoreArr.length;i++){
					for(var j=0;j<that.data.groups[Util.request("groupIndex")].students.length;j++){

						if(that.scoreArr[i].gid==that.data.groups[Util.request("groupIndex")].students[j].gId){
							
							 for(var k=0;k<that.data.groups[Util.request("groupIndex")].students[j].subjects.length;k++){
							 	if(that.scoreArr[i].subjectid==that.data.groups[Util.request("groupIndex")].students[j].subjects[k].subjectId){
							 		
							 		for(var n=0;n<that.data.groups[Util.request("groupIndex")].students[j].subjects[k].jtas.length;n++){
                       	                for(var m=0;m<that.data.groups[Util.request("groupIndex")].students[j].subjects[k].jtas[n].cJtas.length;m++)
                                         if(that.scoreArr[i].cjtaid==that.data.groups[Util.request("groupIndex")].students[j].subjects[k].jtas[n].cJtas[m].cjtaId){
                                         
                                         	that.data.groups[Util.request("groupIndex")].students[j].subjects[k].jtas[n].cJtas[m].score=that.scoreArr[i].score;
                                         	console.log(that.data.groups[Util.request("groupIndex")].students[j].subjects[k].jtas[n].cJtas[m].score)
                                         	console.log(that.scoreArr[i].score)
                                         }
							 	 }
							   }
							 }
						}
					}
				 }
				}
				
				console.log(that.data)

			},
			submit:function(){
				var that=this;
				that.meragedata();
		        that.delunfi();
		       if(Util.request("itemindex")){
   					groupIndex=Util.request("groupIndex")
   				}else{
   					groupIndex=0
   				}
                for(var i=0;i<that.data.groups[groupIndex].students.length;i++){
                
                    var common=$("#txtcommon"+i).val();
                    var otherInfo=$("#otherInfo"+i).text();
                    that.data.groups[groupIndex].students[i].common=common;
                    that.data.groups[groupIndex].students[i].otherInfo=otherInfo;

                };
                var count=[];
				var complete=[];
				var pendkey=Util._getKeyByType(Util.CACHE_TYPE_PEND);
				var completelesson=Piece.Store.loadObject(pendkey);
				if(!completelesson){
					var data =that.data
				   
				   		for(var i=0;i<that.data.groups.length;i++){
				   			if(i!=groupIndex){
				   				data.groups.splice(i,1)
				   			}
				   		} 
				   
				   console.log(data)	
				   complete.push(data);
				   
				}else{
				   var a=0;
				   var b=[];
				   var c=0
				   complete=completelesson;
				   for(var i=0;i<complete.length;i++){
				   		if(complete[i].batchId==that.data.batchId){
				   			for(var j=0;j<complete[i].groups.length;j++){
				   				
				   					if(complete[i].groups[j].groupId==that.data.groups[groupIndex].groupId)
				   					{
				   						complete[i].groups[j]=that.data.groups[groupIndex];
				   						console.log(complete);
				   						c++;
				   					}else{
				   						b.push(i);
				   					}
				   			}
				   		}else{
				   			a++;
				   		}
				   }
				   if(b.length>0&&c==0&&a==0){
				   	  complete[b[0]].groups.push(that.data.groups[groupIndex])
				   }
				   else if(a>0&&b.length==0&&c==0){
				   	  var data =that.data
				   
				   		for(var i=0;i<that.data.groups.length;i++){
				   			if(i!=groupIndex){
				   				data.groups.splice(i,1)
				   			}
				   		} 
				   
				   	  console.log(data)
				   	  complete.push(that.data)
				   }
				   // if(complete[that.iindex]){
				   // 		if(complete[that.iindex].groups[groupIndex]){
				   // 			if(complete[that.iindex].groups[groupIndex].groupId==that.data.groups[groupIndex].groupId){
				   // 				complete[that.iindex].groups[groupIndex]=that.data.groups[groupIndex]
				   // 			}else{
				   // 				complete[that.iindex].groups.push(that.data.groups[groupIndex])
				   // 			}
				   			
				   // 		}else{
				   // 			complete[that.iindex].groups.push(that.data.groups[groupIndex])
				   // 		}

				   // }else{
				   // 		complete.push(that.data);
				   // }
				   
				   
				}
				var len;
				if(count.length>0){
                  len=count[0];
                 
				}else{
					len=complete.length-1;
				}
				Piece.Store.saveObject(pendkey, complete);
                var dialog=new Piece.Dialog(
                	{
                	"autoshow":false,
					"target":"body",
					
				  "content":"课程结果提交本地成功！是否现在上传成绩？"
					},{
					"configs":[{"title":"是",
					"eventName":"ok",
					},{"title":"否",
					"eventName":"cancel",
					}],
					"ok":function(){
                     
						var url="com.ebt.ResultsUpload/ResultsUpload?index="+len;
						that.navigateModule(url,{trigger:true});
						

					},
					"cancel":function(){
						$(".edit").hide();
						$(".s_score").hide();
						$(".c_score").show();
						$(".backclist").show();
						$(".save").hide();
						$(".sub").hide();
						
                       
					}
					});
				
					dialog.show();
              
                
			},
			delunfi:function(){
				var that=this;
				var unfikey=Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				var unfilesson=Piece.Store.loadObject(unfikey);
				if(Util.request("itemindex")){
   					groupIndex=Util.request("groupIndex")
   				}else{
   					groupIndex=0
   				}
				if(unfilesson){
					
						if(unfilesson[that.iindex].batchId==that.data.batchId
							&&unfilesson[that.iindex].trainId==that.data.trainId
							&&unfilesson[that.iindex].instructorId==that.data.instructorId){
							for(var j=0;j<unfilesson[that.iindex].groups.length;j++){
								if(unfilesson[that.iindex].groups[j]){
									if(unfilesson[that.iindex].groups[j].groupId==that.data.groups[groupIndex].groupId){
											unfilesson[that.iindex].groups.splice(j,1)
									}
								}
							}
							if(unfilesson[that.iindex].groups.length==0){
								unfilesson.splice(that.iindex,1)
							}
														
						}
						
					
					Piece.Store.saveObject(unfikey,unfilesson);
					
				}
			    
				
					
				
			},
			chooseAside:function(e){
                var that = this;
				var $target = $(e.currentTarget);
				$target.addClass("sub_active").siblings().removeClass("sub_active");
				var index=$target.index()
				
				$target.parents(".sub_aside").siblings(".jtas_wrap").find(".jtas_item").eq(index).show().siblings().not(".jt_title").hide();
				var sindex=$target.attr('data-sindex');
				that.scrolls(sindex);
			},
			tabstu:function(e){
                var that = this;
				var $target = $(e.currentTarget);
				$target.addClass("active").siblings().removeClass("active");
				var index=$target.index();
				$(".wrap .content").eq(index).show().siblings().hide();
				 that.scrolls(index);
			}
			
		
		});

	});