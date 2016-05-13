define(['text!com.ebt.trainResultView/trainView.html', 'com.ebt.trainResultView/flotr.amd', '../base/openapi', '../base/util', "text!com.ebt.trainResultView/template/trainView.html", "i18n!../base/nls/messageResource", "i18n!../com.ebt.trainResultView/nls/trainResultView"],
  function(viewTemplate, Flotr, OpenAPI, Util, trainViewTemp, baseLocale, Locale) {
    return Piece.View.extend({
      id: 'com.ebt.trainResultView_trainView',
      events: {
        "click .leftTop": "goBack",
        "click .tabItem": "tab",
        "change .sel_year":"changeYear"
       
      },
      //数据索引
      index:0,
      initYear:function(year){
        
          $('.tt').attr("id","tab"+year)
          $('.ta').attr("id",year+"_annualItems")
          $('.tf').attr("id",year+"_firstHalfYearItems")
          $('.ts').attr("id",year+"_secondHalfYearItems")
          $("#ty").text(year);

      },
      changeYear:function(e){
         var that=this;
          var year=$(".sel_year").val();
          that.initYear(year);
          //得到索引值
          that.index=$(".sel_year option").not(function(){ return !this.selected }).attr("index")
          that.beginCanvas(that.data);
          $(".tabItem").eq(0).addClass('tabActive').siblings().removeClass('tabActive')
          if(that.index==(that.len-1)){
            $(".tab").hide();
          
          }else{
             $(".tab").show();
          }

          
      },
      data: null,
      tab: function(e) {
        
        var that = this;
       
        $target = $(e.currentTarget);
        var parentId = $target.parent().attr("id");
       
        $("#" + parentId + " .tabItem").removeClass('tabActive');
        $target.addClass('tabActive');
        var id = $target.attr("id");
        var year = id.split("_")[0];
        var type = id.split("_")[1];
        if (!Util.isNull(that.data)) {

          that.tabToCanvas(that.data, year, type);
        } else {
          new Piece.Toast(baseLocale.request_fail);
        }

      },
      goBack: function() {
        window.history.back();
      },
      render: function() {
        //添加模板
        me = $(this.el);
        var viewT = _.template(viewTemplate, {
          lang: Locale
        });
        viewT = viewT + trainViewTemp;
        me.html(viewT);
        Piece.View.prototype.render.call(this);
        return this;
      },
      requestDataSuccess: function(data) {
        var that = this;
        that.renderTemp(data);
        that.beginCanvas(data);
       
       
      },
      
      renderTemp: function(data) {
      
        data.lang = Locale;
        var that = this;
        var template = me.find("#trainView_template").html();
        var websiteHtml = _.template(template, data);
        $(".ann_wrap").html(websiteHtml);
        that.sel();
        var year =$(".sel_year").val();
        that.initYear(year);
       
       
      },
      //all项长度
      len:0,
      //动态生成select项
      sel:function(){
        var that=this;
        var data=that.data.result;
        var ops=[];
        for(var i=0;i<data.length;i++){
          ops.push(data[i].year);
        }
        
        that.len=ops.length;
        var opthtml=""
        for(var j=0;j<ops.length;j++){
              if(j==0){
                opthtml+='<option selected="selected" value='+ops[j]+' index='+j+'>'+ops[j]+'</option>';
              }else{
                opthtml+='<option  value='+ops[j]+' index='+j+'>'+ops[j]+'</option>';
              }
             
          
        }
       
        $(".sel_year").html(opthtml)
      },
      canvasCode: function(data, type, TYPE, tyepArr, year, minValue, maxValue) {
        if (typeof tyepArr !== "undefined" && tyepArr !== null && tyepArr !== "" && tyepArr.length !== 0) {
          $("#error").hide();
          var container = document.getElementById("annualItems");
          console.log(data);
          function basic(container) {
            // Radar Labels
            var name = "name";
            var score = "score";
            ticks = [];
            for (var i = 0; i < data[TYPE].length; i++) {
              var ticksItem = [];
              ticksItem.push(i);
              ticksItem.push(data[TYPE][i].name)
              ticks.push(ticksItem);
            }
           
            var DATA = [];
            for (var i = 0; i < data[TYPE].length; i++) {
              var DATAItem = [];
              DATAItem.push(0);
              DATAItem.push(parseFloat(data[TYPE][i].score))
              DATA.push(DATAItem);
             
            }
             console.log(DATA);
            var s1 = {
                data: DATA
              },
              graph, ticks;
            // Draw the graph.
            graph = Flotr.draw(container, [s1], {
              radar: {
                show: true
              },
              grid: {
                circular: true,
                minorHorizontalLines: true
              },
              yaxis: {
                min: minValue,
                max: maxValue,
                minorTickFreq: 1
              },
              xaxis: {
                ticks: ticks
              },
              mouse: {
                track: true
              }
            });
          }
          basic(container);
        } else {
          //先请空canvas
          $("#annualItems").html("");
          $(".error").show();
        }
      },
      beginCanvas: function(data) {
        var that = this;
        var resultCode = data.resultCode;
        var myData = data.result[that.index];
       
        //画图开始
        if (resultCode === 0 && typeof myData !== "undefined" && myData !== null && myData !== "" && myData.length !== 0) {
        
            that.canvasCode(myData, "annualItems", "annualItems", myData.annualItems, myData.year, myData.min, myData.max);
         
        }
      },
     
      tabToCanvas: function(data, year, type) {
        var that = this;
        var resultCode = data.resultCode;
        var myData = data.result[that.index];

        //画图开始
        if (resultCode === 0 && typeof myData !== "undefined" && myData !== null && myData !== "" && myData.length !== 0) {
        
          if ((myData.year).toString() === year) {
              if (type === "annualItems") {
                that.canvasCode(myData, type, type, myData.annualItems, myData.year, myData.min, myData.max);
              }
              if (type === "firstHalfYearItems") {
                that.canvasCode(myData, type, type, myData.firstHalfYearItems, myData.year, myData.min, myData.max);
              }
              if (type === "secondHalfYearItems") {
                that.canvasCode(myData, type, type, myData.secondHalfYearItems, myData.year, myData.min, myData.max);
              }
            }
        }

       
      },
     
      getData: function() {
        var that = this;
        var networkState = navigator.network.connection.type || navigator.connection.type;
        if (Connection.NONE === networkState) {
          new Piece.Toast(baseLocale.network_not_available);
          return;
        } else {
          Util.requestUserAbility(function(data, textStatus, jqXHR) {
            console.log(data);
            that.allData(data,textStatus, jqXHR);
           
          }, function() {
            new Piece.Toast(baseLocale.request_fail);
            return;
          });
        }
      },
     
       //合并得到所有数据
      allData:function(data,textStatus, jqXHR){
          var arr=[];
              for(var i=0;i<data.result.length;i++){
                  for(var j=0;j<data.result[i].annualItems.length;j++){
                      arr.push(data.result[i].annualItems[j])
                    }
                }
            
              var obj={};

              for(var k=0;k<arr.length;k++){
                
                if(!obj[arr[k].name]){

                    obj[arr[k].name]={};
                    obj[arr[k].name].name=arr[k].name;
                    obj[arr[k].name].score=parseFloat(arr[k].score);
                    obj[arr[k].name].len=1;
                    
                  }else{
                    obj[arr[k].name].len++;
                    obj[arr[k].name].score=parseFloat(obj[arr[k].name].score)+parseFloat(arr[k].score);
                      
                   
                    }
                    
                }
                console.log(obj)
              var allyear=[]
              for(var key in obj){

                 obj[key].score=parseFloat(obj[key].score)/parseFloat(obj[key].len);
                 delete obj[key].len;
                 allyear.push(obj[key])
              }

              var allitem={
                  "year":"all",
                  "max":5,
                  "min":0,
                  "annualItems":allyear,
                  "secondHalfYearItems":[],
                  "firstHalfYearItems":[]
                  };
              var that=this;
              data.result.push(allitem);
              that.data=data;
              console.log(that.data);
              that.requestDataSuccess(data)
      },
      onShow: function() {
        var that = this;
        Util.clearWarn(that.el);
       
        if (!Util.checkConnection()) {
          new Piece.Toast(baseLocale.network_not_available);
        } else {
          that.getData();
        }
        
       
      
      }
    }); 

  });