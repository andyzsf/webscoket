$(document).ready(function () {
    $("#btn").click(function () {
        var message = $('#messageform').formToDict();
        window.console.log(message);
        ws.send(JSON.stringify(message));
        //$('#messageform').find("input[type=text]").val("").select();
        return false;
    });
    //$("#message").select();
});
var ws = new WebSocket('ws://' + location.host + '/chatsocket');


ws.onmessage = function (msg) {
    var message = JSON.parse(msg.data);
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