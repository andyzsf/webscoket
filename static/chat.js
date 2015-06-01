var tag = 1;
var isusing = false;
$(document).ready(function () {
    $("#btn").click(function () {
        var message = $('#messageform').formToDict();
        //window.console.log(message);
        ws.send(JSON.stringify(message));
        //$('#messageform').find("input[type=text]").val("").select();
        $('#message').val("");
        tag = 0;
        newMessageRemind.clear();
        return false;
    });
    //$("#message").select();
});
var ws = new WebSocket('ws://' + location.host + '/chatsocket');


ws.onmessage = function (msg) {
    var message = JSON.parse(msg.data);
    if (tag == 1){
        if (!isusing) {
            newMessageRemind.show();
            isusing = true;
        }
    }
    else{
        // if (isusing) {
        //    newMessageRemind.clear();
        //    isusing = false;
        //}
        tag = 1;
    }
    var existing = $("#m" + message.id);
    if(existing.length > 0) return;
    var node = $(message.html);
    node.hide();
    $("#inbox").append(node);
    node.slideDown();
};


jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {};
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};


var newMessageRemind={
_step: 0,
_title: document.title,
_timer: null,
//显示新消息提示
show:function(){
var temps = newMessageRemind._title.replace("【　　　】", "").replace("【新消息】", "");
newMessageRemind._timer = setTimeout(function() {
newMessageRemind.show();
    //这里写Cookie操作
    newMessageRemind._step++;
    if (newMessageRemind._step == 3) { newMessageRemind._step = 1 };
    if (newMessageRemind._step == 1) { document.title = "【　　　】" + temps };
    if (newMessageRemind._step == 2) { document.title = "【新消息】" + temps };
    }, 800);
    return [newMessageRemind._timer, newMessageRemind._title];
},
//取消新消息提示
clear: function(){
clearTimeout(newMessageRemind._timer );
document.title = newMessageRemind._title;
//这里写Cookie操作
}

};

//document.getElementById("btn").onclick=function(){
//    if(!isusing){
//        isusing = true;
//        newMessageRemind.show();
//    }
//};

document.onclick=function(event){
    event = event || window.event;
    var isone ="";
    if(!document.all){
        isone = event.target.id.toUpperCase();
    }
    else{
        isone = event.srcElement.id.toUpperCase();
    }
    if(isone!=="TEST"){
        isusing = false;
        newMessageRemind.clear();
    }
};