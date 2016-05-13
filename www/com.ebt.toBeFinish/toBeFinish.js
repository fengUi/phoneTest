define(['text!com.ebt.toBeFinish/toBeFinish.html', 'text!com.ebt.toBeFinish/template/toBeFinish_template.html', '../base/util', '../base/openapi', '../base/date', "i18n!../com.ebt.toBeFinish/nls/toBeFinish"],
	function(viewTemplate, toBeFinish_template, Util, OpenAPI, DateUtil, Locale) {
		return Piece.View.extend({
			id: 'com.ebt.toBeFinish_toBeFinish',
			events: {
				"click .goBack": "backhome",
				"click .refresh": "refresh",
				"click .search": "showSearchDialog",
				"click .cancelBtn": "closeSearchDialog",
				"click #skilledLevel": "chooseLevel",
				"click .chooseCourseTime": "chooseCourseTime",
				"click .confirmBtn": "queryCourse",
				"click .course_item": "item_click",
				"click .skilledLevelItem": "chooseSkilledLevel"
			},
			$editCourse: "<div class='editCourse'></div>",
			ActypeArr: [],
			myScroll: null,
			backhome: function() {
				var url = 'com.ebt.course/allCourse';
				this.navigateModule(url, {
					trigger: true
				});
			},
			refresh: function() {
				this.onShow();
			},
			item_click: function(e) {
				var that = this;
				var $target = $(e.currentTarget);
				var className = e.target.className;
				// 如果点到打钩和编辑的图像则不跳转
				if ($(e.target).attr("data-dagou") === "dagou") {
					// 课程选择
					that.chooseCourse($target);
					return;
				}else{
					var that = this;
					var index = $target.attr("data-resultsindex");
					that.toBeFinishBatch(index);
				}
				
			},
			
			fiterarr:[],
			chooseCourse: function($pars) {
				var that = this;
				if ($pars.attr("data-select") == "true") {
					$pars.attr("data-select", "false");
				} else {
					$pars.attr("data-select", "true");
				}
				$pars.find(".pass_state").toggle();
				var object = {};
				object.index = $pars.find(".pass_state").attr("data-Index");
				object.Item = $pars.find(".pass_state").attr("data-Item");
				if($pars.attr("data-select")=="true"){

					if(that.fiterarr.length>0){
						for(var i=0;i<that.fiterarr.length;i++){
							if(that.fiterarr[i].index!=object.index||that.fiterarr[i].Item!=object.Item){
								that.fiterarr.push(object);
								console.log(that.fiterarr);
								return
							}else{
								return;
							}
						}
					}else{
						that.fiterarr.push(object);
						console.log(that.fiterarr);
						return
					}
				}else{
					for(var i=0;i<that.fiterarr.length;i++){
						if(that.fiterarr[i].index==object.index||that.fiterarr[i].Item==object.Item){
							that.fiterarr.splice(i,1);
							console.log(that.fiterarr);
							return
						}else{
							return;
						}
					}
				}
			},
			
			render: function() {
				var viewT = _.template(viewTemplate, {
					lang: Locale
				});
				//添加模板

				viewT = toBeFinish_template + viewT;
				$(this.el).html(viewT);

				Piece.View.prototype.render.call(this);
				return this;
			},
			data:null,
			//添加索引
			propindex:function(dataitem){
			   var index=Util.request("index");
               for(var i=0;i<dataitem.length;i++){
               	 	if(index!=""){
               	 	 dataitem[i].itemindex=index
               	 	}else{

                     dataitem[i].itemindex=i;
               	 	}
               	 	for(var j=0;j<dataitem[i].groups.length;j++){
               	 		for(var k=0;k<dataitem[i].groups[j].students.length;k++){
                        	dataitem[i].groups[j].students[k].stuindex=j;
               	 		} 
               	 	}
               	
               }
               return dataitem;
			},
			requestData: function() {
				var that = this;
				var pendkey = Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				var completeLesson=Piece.Store.loadObject(pendkey);
				// Piece.Store.deleteObject(pendkey)
				that.data=that.propindex(completeLesson);
				Piece.Session.saveObject("completeLesson",that.propindex(completeLesson));
				console.log(that.data)
				that.renderTemp(that.renderData(that.data).result);
				//that.setAutoTimeForQueryCourse();
			},
			renderData:function(data){
				var tempData = {};
				tempData.Locale = Locale;
				tempData.result = data;
				var obj={};
				for(var i=0;i<tempData.result.length;i++){
					if(tempData.result[i].startTime){
						var date = tempData.result[i].startTime.toString();
					}else{
						var date = tempData.result[i].batchStartTime.toString();
					}
					
					var stArr=date.split(" ");
					var stime=stArr[0].split("-");
					var month=stime[1];
					if(!obj[month]){
						obj[month]={}
						obj[month].month=month;
						obj[month].results=[];
						obj[month].results.push(tempData.result[i]);
						// console.log(tempData.result[i])
					}else{
						obj[month].results.push(tempData.result[i])
					}
				}
				var monthitem=[]
				for(var key in obj){
					monthitem.push(obj[key])
				}
				tempData.result=monthitem;
				// console.log(tempData);
				return tempData;

			},
			toBeFinishBatch:function(index){
				var that = this;
				var pendkey = Util._getKeyByType(Util.CACHE_TYPE_UNFI);
				var completeLesson=Piece.Store.loadObject(pendkey);
				
				// Piece.Store.deleteObject(pendkey)
				//that.data=completeLesson[index];
				console.log(that.data[index])
				Piece.Session.saveObject("toBeFinishBatch",that.data[index])
				var url = 'com.ebt.toBeFinish/toBeFinishBatch';
                        this.navigateModule(url, {
                              trigger: true
                        });
			},
			renderTemp: function(data) {
				var that = this;
				Util.clearWarn(that.el);
				$(".title").text(Locale.uploadLesson);
				var template = $(this.el).find("#toBeFinish_template").html();
				var websiteHtml = _.template(template, data);
				// that.eachAcType(that.data);
				$("#scroller").html("");
				$("#scroller").append(websiteHtml);
				if (this.myScroll) {
					this.myScroll.refresh();
				} else {
					this.myScroll = new iScroll('wrapper', {
						// checkDOMChanges: true
					});
				}
			},
			onShow: function() {
				var that = this;
				console.log('进入未完成页面=============：');	
				that.requestData();
				//write your business logic here :)
			}

		}); //view define

	});