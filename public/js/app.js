/**
 * @Lab frontend
 * @author Taka Wang
 *
*/
var app = {
    defaults: {
        active: ""
    },
    ctlMap : {
        container: $("#container"),
        logger: $("#logger_list"),
        beacon: $("#beacon_list"),
        scale:  $("#scale_list"),
        qrcode: $("#qrcode_list")
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
    render_logger: function() {
        var context = {title : "logger"};
        app.ctlMap.container.html(app.template.mytemplate(context));
    },
    render_beacon: function() {
        var context = {title : "beacon"};
        app.ctlMap.container.html(app.template.mytemplate(context));
    },
    render_scale: function() {
        var context = {title : "scale"};
        app.ctlMap.container.html(app.template.mytemplate(context));
    },
    render_qrcode: function() {
        var context = {title : "qrcode"};
        app.ctlMap.container.html(app.template.mytemplate(context));
    },
    bindEvent: function() {
        console.log("bindEvent");
        $(document).on("pagechange", function(e, page, obj) {
            app.defaults.active = page;
            obj.parent().addClass("active").siblings().removeClass("active");
            switch (page) {
                case "logger":
                    app.render_logger();
                    break;
                case "beacon":
                    app.render_beacon();
                    break;
                case "scale":
                    app.render_scale();
                    break;
                case "qrcode":
                    app.render_qrcode();
                    break;
            }

        });

        app.ctlMap.logger.click(function() {
            $(document).trigger("pagechange", ["logger", $(this)]);
        });
        app.ctlMap.beacon.click(function() {
            $(document).trigger("pagechange", ["beacon", $(this)]);
        });
        app.ctlMap.scale.click(function() {
            $(document).trigger("pagechange", ["scale", $(this)]);
        });
        app.ctlMap.qrcode.click(function() {
            $(document).trigger("pagechange", ["qrcode", $(this)]);
        });
    },
    destroy: function() {
        console.log("destroy");
    }
};

$(function(){
    app.init();
    mqtt.connect();
});