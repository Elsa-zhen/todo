var myScroll=new IScroll(".content",{
    scrollbars:true,
    fadeScrollbars:true,
    mouseWheel:true,
    click:true  //移动端不设置就不能点
});


var mySwiper = new Swiper ('.swiper-container', {
    // direction: 'vertical',
    loop: true,

    // 如果需要分页器
    pagination: {
        el: '.swiper-pagination',
    },
});





// 全局变量
var state="wait";

//事件添加
    $('.btnbox div').click(function(){
        $('.btnbox div').removeClass("active").filter(this).addClass("active")
            if($('.wait').hasClass('active')){
                state='wait';
            }else{
                state='done';
            }
        reWrite();
        myIScroll.scrollTo(0, 0, 0);//每次重绘要回到顶部
    });

    $('#add').click(function(){
        $('#main')
            .css('background','blur(2px)')
            .next()
            .show()
            .find('#editarea')
            .queue(function(){
               $(this).addClass('show').dequeue();
               $('#text')[0].focus();
            });
    });

    $('#submit').click(function(){
        var text=$('#text').val();
        if(text===""){
            console.log('请输入');
            return
        }
        $('#text').val("");
        var time = new Date().getTime();
        var data = getData();
        var color=getColor(colorArr);
        data.push({con: text, time, isStar: 0, isDone: 0,color});
        saveData(data);
        reWrite();
        $('#editarea')
            .removeClass('show')
            .parent()
            .hide()
            .prev()
            .css("filter", "")
    });

    $('.close').click(function(){
        $("#editarea")
            .removeClass('show')
            .parent()
            .hide()
            .prev()
            .css("filter", "")
    });

    $('.showclose').click(function () {
        $('.showarea')
            .removeClass('show')
            .parent()
            .hide()
            .prev()//找前面的
            .css('filter', '')  //filter:模糊
    });

    // 点击完成--移动到已完成中----------------
    $('.content').on('click', '.right', function () {
        var data = getData();
        var index = $(this).parent().attr('id');//获取到li中的id
        data.reverse();//顺序颠倒
        data[index].isDone = 1;
        data.reverse();//顺序再返回去
        saveData(data);
        reWrite();
    })

    //点击五角星--颜色改变--------------------
    $('.content').on('click', '.iconfont', function () {
        var data = getData();
        var index = $(this).parent().attr('id');
        data.reverse();
        data[index].isStart = data[index].isStart===1 ? 0 : 1;
        //先判断当前是真假 真的是1
        data.reverse();
        saveData(data);
        reWrite();
    })

    //已完成中的----删除----------------
    $('.content').on('click','.del', function (){
        var data = getData();
        var index = $(this).parent().attr('id');
        data.reverse();
        data.splice(index, 1)//删除某一个
        // data.reverse();
        saveData(data);
        reWrite();
    })

    //---省略号内容---------------------
    $('.content').on('click', 'p', function () {
        var text = $(this).html();
        $('#main').css('filter', 'blur(2px)');
        $('#mask')
            .show()
            .find('.showarea')
            .delay(500)
            .queue(function () {
                $(this)
                    .addClass('show')
                    .dequeue();
                $('.show-inner').html(text);
                $('.showclose').html('X')
                
            })
    })

    $('#dell').click(function(){
        $('.content ul li').each(function(index,ele){
            console.log($(ele).find('input').attr('checked'))
            // if($(ele).attr('checked')==true){
            //     clear();
            // }
        })
    })

    //重给函数
    function reWrite() {
        var data = getData();
        $('.content ul').empty();//删除所有的子节点
        data.reverse();//将内容顺序颠倒 新添加的再最前面
        var str = '';
        $.each(data, function (index, val) {
            if (state == 'wait') {//如果是未完成的
                if (val.isDone == 0) {
                    var className = val.isStart ? 'active' : '';//给星星加颜色
                    str += "<li id='" + index + "'  style='background:" + val.color + "'><input type='checkbox'><time>" + getDate(val.time) + "<br><span>" + getTime(val.time) + "</span></time> <p>" + val.con + "</p> <span   class='iconfont " + className + " '>&#xe65f;</span><div class='right'>完成</div></li>";
                }
            }
            else if (state == 'done') {//如果是已完成的状态
                if (val.isDone == 1) {
                    str += "<li id='" + index + "'   style='background:#CCCCCC'><input type='checkbox'><time>" + getDate(val.time) + "<br><span>" + getTime(val.time) + "</span></time> <p>" + val.con + "</p><span class='iconfont '>&#xe65f;</span><div class='del'>删除</div></li>";
                }
            }
        });
        $('.content ul').html(str);
        addEvent();
        myScroll.refresh();
    }
    reWrite();
    //工具函数
    function getData(){
        return localStorage.todo?JSON.parse(localStorage.todo):[];
    }
    function saveData(data){
        localStorage.todo=JSON.stringify(data);
    }

    var colorArr = ['0', '3', '6', '9', 'c'];
    function getColor() {//随机颜色
        var str = '#';
        for (var i = 0; i < 3; i++) {
            var c = colorArr[Math.floor(Math.random() * colorArr.length)];
            str += c;
        }
        return str;
    }

    function getDate(ms){
        var date=new Date();
        date.setTime(ms);
        var year=date.getFullYear();
        var month=addZero(date.getMonth()+1);
        var day=addZero(date.getDate());
        return year+"-"+month+"-"+day;
    }

    function addZero(num){
        return num<10 ? "0"+num:num;
    }

    function getTime(ms){
        var date=new Date();
        date.setTime(ms);
        var hours=date.getHours();
        var minute=addZero(date.getMinutes());
        var second=addZero(date.getSeconds());
        return hours+":"+minute+":"+second;
    }

    var max = $(window).width() / 3;
    function addEvent() {
        $('.content ul li').each(function (index, ele) {
            var hammer = new Hammer(ele);//!!!!!!!!!注意引用js文件
            var mx;
            var state = 'start';
            hammer.on('panstart', function () { //------触屏开始
                $(ele).css('transition', 'none');
            })
            hammer.on('pan', function (e) { //-------触屏移动
                mx = e.deltaX; //拖动距离
                if (state == 'start') {
                    if (mx > 0) {//刚开始拖
                        return;
                    }
                }
                if (state == 'end') {
                    if (mx < 0) {
                        return;
                    }
                    if(-max+mx > 0){
                        return;
                    }
                    mx = -max+mx;
                }
                if (Math.abs(mx) > max) {
                    return;
                }
                $(ele).css('transform', "translate3d(" + mx + "px,0,0)")
            })
            hammer.on('panend', function () { //------拖动结束
                $(ele).css('transition', 'all 1s');
                if (Math.abs(mx) > max / 2) {//无论左右拖动
                    $(ele).css('transform', 'translate3d(-'+max+'px,0,0)');
                    state = 'end';
                }
                else {
                    $(ele).css('transform', 'translate3d(0,0,0)');
                    state = 'start';
                }
            })
        })
    }

    //--------清空---------------------
    function clear() {
           var data=getData();
             data=$.grep(data,function(ele,index){
                return ele.isDone===0;
            });
            saveData(data);
            reWrite();
    }



