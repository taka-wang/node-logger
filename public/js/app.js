/**
 * @Lab frontend
 * @author Taka Wang
 *
*/
var app = {
    ctlMap : {
        container: $("#container")
    },
    template : {
        mytemplate: Handlebars.compile($("#mytemplate").html())
    },
    init: function() {
        console.log("init");
        app.bindEvent();
        //render default
        app.ctlMap.container.html(app.template.mytemplate({title: "Hello World"}));
    },
    bindEvent: function() {
        console.log("bindEvent");
    },
    destroy: function() {
        console.log("destroy");
    }
};

$(function(){
    app.init();
    mqtt.connect();
    setTimeout(function(){ 
        mqtt.disconnect();
    }, 3000);
});