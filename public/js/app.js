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
        container:  $("#container"),
        logger:     $("#logger_list"),
        beacon:     $("#beacon_list"),
        nearest:    $("#div-nearest"),
        rssi:       $("#div-rssi"),
        scale:      $("#scale_list"),
        qrcode:     $("#qrcode_list")
    },
    template : {
        default: Handlebars.compile($("#default-template").html()),
        logger:  Handlebars.compile($("#logger-template").html()),
        beacon:  Handlebars.compile($("#beacon-template").html()),
        nearest: Handlebars.compile($("#nearest-template").html()),
        rssi:    Handlebars.compile($("#rssi-template").html()),
        scale:   Handlebars.compile($("#scale-template").html()),
        qrcode:  Handlebars.compile($("#qrcode-template").html())
    },
    clear_storage: function() {
        localStorage.removeItem("nearest");
        localStorage.removeItem("rssi");
        localStorage.removeItem("scale");
        localStorage.removeItem("qrcode");
    },
    init: function() {
        console.log("init");
        app.clear_storage();
        app.bindEvent();
        app.render("default");
    },
    render: function(type) {
        switch (type) {
            case "logger":
                var context = {title : "Logger"};
                app.ctlMap.container.html(app.template.logger(context));
                break;
            case "beacon":
                var context = {title : "Beacon"};
                app.ctlMap.container.html(app.template.beacon(context));
                break;
            case "nearest":
                var context = (localStorage["nearest"]) ? JSON.parse(localStorage["nearest"]) : {};
                app.ctlMap.nearest.html(app.template.nearest(context));
                break;
            case "rssi":
                var context = (localStorage["rssi"]) ? JSON.parse(localStorage["rssi"]) : {};
                console.log(context);
                break;
            case "scale":
                var context = (localStorage["scale"]) ? JSON.parse(localStorage["scale"]) : {};
                app.ctlMap.container.html(app.template.scale(context));
                break;
            case "qrcode":
                var context = (localStorage["qrcode"]) ? JSON.parse(localStorage["qrcode"]) : {};
                app.ctlMap.container.html(app.template.qrcode(context));
                break;
            default:
                app.ctlMap.container.html(app.template.default({title: "Welcome"}));
        }
    },

    bindEvent: function() {
        console.log("bindEvent");

        $(document).on("mqttchange", function(e, type, obj) {
            var context = null;
            switch (type) {
                case "logger":
                    break;
                case "nearest":
                    var nearest = JSON.parse(obj);
                    context = { id: nearest.id, val: nearest.val, time: new Date().toLocaleString() };
                    localStorage.setItem("nearest", JSON.stringify(context));
                    if (app.defaults.active == "beacon") return app.render(type);
                case "rssi":
                    // append new rssi to object array (limit 30)
                    context = (localStorage["rssi"]) ? JSON.parse(localStorage["rssi"]) : [];
                    context.push(JSON.parse(obj));
                    localStorage.setItem("rssi", JSON.stringify(context.slice(0, 30)));
                    if (app.defaults.active == "beacon") return app.render(type);
                case "scale":
                    context = { payload: obj, time: new Date().toLocaleString() };
                    localStorage.setItem("scale", JSON.stringify(context));
                    break;
                case "qrcode":
                    context = { payload: obj, time: new Date().toLocaleString() };
                    localStorage.setItem("qrcode", JSON.stringify(context));
                    break;
            }
            if (app.defaults.active == type) app.render(type);
        });

        $(document).on("pagechange", function(e, page, obj) {
            app.defaults.active = page;
            obj.parent().addClass("active").siblings().removeClass("active");
            app.render(app.defaults.active);
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