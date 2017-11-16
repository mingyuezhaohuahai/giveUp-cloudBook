//苹果手机上只有a/button可以on("click")

//没有href的a 不是a;估计没有tupy的button也不是button
// 用touchstart事件就没这个担忧


var obj_={};
obj_.$body=$('body');

//bind
if (!Function.prototype.bind) {//如果原型上没有bind方法
    Function.prototype.bind = function (context) {
        var args = arguments,//获取要传入的所有参数
            obj = arguments[0],//获取要绑定的上下文
            func = this;//获取要调用的函数
        return function(){//返回一个新的函数
            var argc = Array.prototype.slice.call(args,1);//获取bind的剩余传入参数
            Array.prototype.push.apply(argc,arguments);//将调用时的参数放到最后
            return func.apply(obj||null,argc);//使用新的this执行func函数
        }
    }
}


//显示提示
function showTips(showText,hideTime){
	var style={
		'position': 'fixed',
		'overflow':'hidden',
		'height':'50px',
		'lineHeight':'50px',
		'color':'#fff',
		'top':'50%',
		'left':'50%',
		'background': 'rgba(0,0,0,0.85)',
		'textAlign': 'center',
		'width':'0px',
		'transform': 'translate(-50%,-50%)',
		'-webkitTransform': 'translate(-50%,-50%)',
		'transition':'all 0.3s'
	};
	var $html=$('<div class="tips_once">'+showText+'</div>');
	$html.css(style);
	$("body").append($html);
	setTimeout(function(){
		$(".tips_once").css("width","350px");
	},100);
	setTimeout(function(){
		$(".tips_once").remove();
	},hideTime)
}


//里面有判断上滑下滑的逻辑
function initSW_procedure(){
	var touchStartY = 0;
	var $procedure_slide = $(".swiper-container.procedure .swiper-slide");
	var topMin = 0;
	var topMax=0;//37
	var timer=null;

	var procedureSwiper = new Swiper('#procedure', {
		direction: 'vertical',
		loop: false,
		freeMode: true,
		onInit:function(swiper){
			topMax = parseInt($procedure_slide.css("height")) - parseInt($("#procedure").css("height"));
			swiper.enableTouchControl();
			swiper.lockSwipes();
		},
		onTouchStart: function (swiper, event) {
			touchStartY = event['changedTouches'][0]['screenY'];
		},
		onTouchEnd: function (swiper, event) {

			var touchEndY = event['changedTouches'][0]['screenY'];
			var oldTop = parseInt($procedure_slide.css("top") );
			var target,dir;

			//可以向下滑
			if (touchEndY -touchStartY> 0 && oldTop < topMin)
			{
				dir=1;
				if (Math.abs(touchEndY - touchStartY) > Math.abs(oldTop)) {
					target=0;
				} else {
					target=oldTop+(touchEndY-touchStartY);
				}
				move_procedureSwiper(oldTop,target,dir);
			}
			//可以上滑动
			else if (touchEndY -touchStartY< 0 && oldTop >-topMax)
			{
				dir=-1;
				//上多少
				if (Math.abs(oldTop+touchStartY - touchEndY) >topMax) {
					target=-topMax;
				} else {
					target=oldTop+(touchEndY -touchStartY);
				}

				move_procedureSwiper(oldTop,target,dir);
			}



		}
	});

	function move_procedureSwiper(now,target,dir){
		var _now=now;
		if(timer===null){
			timer=setInterval(function(){
				now+=dir*2;
				if((_now<target&&now>=target)||(_now>target&&now<=target)){
					$procedure_slide.css("top",target);
					clearInterval(timer);
					timer=null;
				}else{
					$procedure_slide.css("top",now);
				}

			},5);
		}else{
			//console.log("还不能移动");
		}
	}
}


//设置value为pxx的项选中
$("selector").val("pxx");


//if(window.innerWidth == 320 && userAgent.indexOf("Safari") > -1)



//上传图片
function uploadImg($inputFile,url,callback){
	//创建FormData对象
	var data = new FormData();
	//为FormData对象添加数据
	$.each($inputFile[0].files, function(i, file) {
		data.append('imageFile', file);
	});
	//todo 做个判断是不是图片数据
	$.ajax({
		url:url,
		type:'POST',
		data:data,
		cache: false,
		contentType: false,    //不可缺
		processData: false,    //不可缺
		success:function(data){
			callback(data);
		},
		error:function(){
			console.dir(arguments);
		}
	});
}


//获取验证码的逻辑
obj_.$body.on('click','a.getCode_for_changeTel',function(){
    //获取验证码的按钮
    var $btn_getPhoneTestCode='';

    //倒数秒的时候如果点击，什么都不做。(因为倒数的时候加上了cannot这个class)
    if($btn_getPhoneTestCode.attr("class").indexOf("cannot")!==-1){
        return false;
    }

    //用于获取验证码的填写手机号的input框
    var $tel_input='';
    //显示验证信息的元素
    var $p='';

    //判断手机号是否正确
    var isTelRight=true;

    //这儿根据实际情况写如何判断
    //code

    if(isTelRight){
        //手机号正确--》发送请求获取验证码
        getCode($tel_input.val(),$btn_getPhoneTestCode);
    }else{
        //手机号错误做什么。。
    }
});
//1)获取验证码:获取验证码,注意url
function getCode(tel,$btn_getPhoneTestCode){
    $.ajax({
        type:"post",
        url:"{:U('About/change_mobile')}",
        data:"mobile="+tel,
        success:function(txt){
            doRes_getCode(txt,$btn_getPhoneTestCode);
        },
        error:function(){
            console.dir(arguments);
        }
    });
}
//2)获取验证码:处理返回的数据
function doRes_getCode(txt,$btn_getPhoneTestCode){

    //用来显示错误信息的元素
    var $showInfo="";

    if(txt.status==0)
    {
        //获取失败
        if(txt.info.error) {//特殊的失败
            $showInfo.html(txt.info.error).addClass("error");
            thisTimer(txt.info.time,"秒后重试",$btn_getPhoneTestCode);
        }else{//其他的失败
            $showInfo.html(txt.info).addClass("error");
        }
        setTimeout(function(){
            $showInfo.removeClass('error');
        },5000);

    }
    else
    {
        //获取成功：倒数秒
        $showInfo.html('正确').removeClass("error");
        thisTimer(60,"秒",$btn_getPhoneTestCode);
    }

    //second，倒数的总秒数
    //infoTxt 40秒/45秒后重试，后面的文字
    function thisTimer(second,infoTxt,$btn_getPhoneTestCode){
        var sec=second;
        var timer=null;
        $btn_getPhoneTestCode.addClass("cannot");
        timer=setInterval(function(){
            $btn_getPhoneTestCode.html(sec+infoTxt);
            sec--;
            if(sec==0){
                $btn_getPhoneTestCode.removeClass("cannot");
                clearInterval(timer);
                timer=null;
                $btn_getPhoneTestCode.html("获取验证码");
            }
        },1000);
    }

}

//replace
var html=$ele.html();
html=html.replace(/[。？]/g,function(kw){
	return kw+"<br/>" ;
});


//swiper重新更新slide之后要调用下面两个方法；
//swiper_instance.update(true);
//swiper_instance.reLoop();


//页面的渲染过程
/*
	一边解析html，一边构建DOM树；
	遇到link/script都会阻塞解析，直到外部资源加载并解析或执行完毕后才会继续向下解析html。
	
	对于样式与脚本的先后顺序同样也会影响到浏览器的解析过程，究其原因主要在于：
		script脚本执行过程中可能会修改html界面（如document.write函数）；
		DOM节点的CSS样式会影响js的执行结果。
	
	1）外部样式不会阻塞后续外部脚本的加载，但是会阻塞后续脚本执行，
		直到外部样式加载并解析完毕。
	2）如果后续外部脚本含有async属性（IE下为defer），外部样式不会阻塞该脚本的加载与执行。
	3）对于动态创建的link标签不会阻塞其后动态创建的script的加载与执行，不管script标签是否具有async属性，
		但对于其他非动态创建的script，以上三条结论仍适用
	什么情况下会触发重绘或重排？
	1增加或删除DOM节点
	2设置 display: none;（重排并重绘） 或者 visibility: hidden（只有重绘）
	3移动页面中的元素
	4增加或者修改样式
	5用户 改变窗口大小，滚动页面等
	减少重绘和重排？
	1，不要一个一个地单独修改属性，最好通过一个classname来定义这些修改
	2，把对节点的大量修改操作放在页面之外 --> documentFragment
	3，不要频繁获取计算后的样式。如果你需要使用计算后的样式，
		最好暂存起来而不是直接从DOM上读取。
*/
//经测试：
// 开头有js:
// 会把所有的非异步的js执行完才开始绘制页面。
//所以，先把loding的样式摆好，再执行js预加载。

//js都在body结尾：
//js执行完之前，就算图片下载好了也不会绘制，文字会显示，css会应用。

//script是不是用src引入也有差异。
//所以我的预加载最好放在js的最开始执行。



//居然有这个：insertRule(rule,index) deleteRule(index)  


//监听屏幕滚动然后干嘛，用这个$(window).scroll()

/*
 方式一：用ajax请求服务器最新文件，并加上请求头If-Modified-Since和Cache-Control,如下:
 $.ajax({
     url:'www.haorooms.com',
     dataType:'json',
     data:{},
     beforeSend :function(xmlHttp){
         xmlHttp.setRequestHeader("If-Modified-Since","0");
         xmlHttp.setRequestHeader("Cache-Control","no-cache");
     },
     success:function(response){
        //操作
     }
     async:false
 });
 直接用cache:false,
     $.ajax({
         url:'www.haorooms.com',
         dataType:'json',
         data:{},
         cache:false,
         ifModified :true ,
         async:false,
         success:function(response){
            //操作
         }
     });
* */

//好玩儿
$('[style]').each(function(){
	if($(this).css('display')=='none'){
		$(this).css('display','block');
	}
});


//注入js
var script = document.createElement('script');
var code = '!function(){' + getJs() + '\n}();';
script.appendChild(document.createTextNode(code));
document.head.appendChild(script);


//这样会直接执行匿名函数，比(function(){})();写起来更好看;
!function(){console.log('哈哈哈')}


//要加载音频，不用play()，用load()

//1、canvas绘图，img需要onload才能drawImg
//2、hash数组，length永远为0


//window.pageYOffset 度量滚动距离，用css像素度量。

//screen.width 度量屏幕的尺寸，这个值不会改变

//window.width 度量浏览器窗口的尺寸，用css像素度量，会随着用户改变浏览器的宽高改变。

//html的宽度width:100%，这个100%是viewport的100%。
//单用户放大页面的时候，问题就来了。文档实际的宽度会大于100%viewport

//document.documentElement.clientWidth和-Height 度量viewport的尺寸,css像素度量。

//viewport的宽度+滚动条宽度=window.innerWidth

//document.documentElement.offsetWidth/Height 度量Html元素的尺寸

//事件中的坐标：pageX/Y相对于html元素CSS像素度量, clientX/Y相对于viewportCSS像素度量, screenX/Y对于屏幕设备像素度量 