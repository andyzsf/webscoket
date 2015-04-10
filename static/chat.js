var ws = new WebSocket('ws://localhost:8888/chatsocket');

ws.onopen = function(msg){

}
ws.onmessage = function(msg){
    var existing = $("#" + msg.id);
    if(existing.length > 0) return;
    var node = $(message.html);
    node.hide();
    $("#inbox").append(node);
    node.slideDown();
}
ws.onclose = function(msg){

}

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

$(document).ready(function(){
    $("#messageform").click(function(){
        var message = $(this).formToDict();
        window.console.log(message);
        ws.send(JSON.stringify(message));
    })
})