/**
 * @Lab frontend
 * @author Taka Wang
 *
*/
var app = {
    defaults: {
        active:  "",
        beacons: {},
        items:   {}
    },
    ctlMap : {
        container:  $("#container"),
        logger:     $("#logger_list"),
        beacon:     $("#beacon_list"),
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
    get_beacons: function() {
        $.ajax({
            type: "GET",
            timeout: 1000,
            cache: false, // do not cache
            url: "/api/beacons",
            dataType: 'json',
            success: function(data) {
                data.forEach(function(beacon) {
                    app.defaults.beacons[beacon.id] = beacon.name;
                });
            },
            error: function(xhr, type){
                console.log("Fail!");
            }
        });
    },
    get_loggers: function() {
        $.ajax({
            type: "GET",
            timeout: 5000,
            cache: false, // do not cache
            url: "/api/logs",
            dataType: 'json',
            success: function(data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].nearest = (typeof app.defaults.beacons[data[i].nearest] == "undefined") 
                                        ? data[i].nearest : app.defaults.beacons[data[i].nearest]; 
                    data[i].qrcode  = (typeof app.defaults.items[data[i].qrcode] == "undefined") 
                                        ? data[i].qrcode : app.defaults.items[data[i].qrcode];
                    data[i].created_at = new Date(data[i].created_at).toLocaleString();
                }
                return data;
            },
            error: function(xhr, type){
                console.log("Fail!");
            }
        });
    },
    get_items: function() {
        $.ajax({
            type: "GET",
            timeout: 1000,
            cache: false, // do not cache
            url: "/api/items",
            dataType: 'json',
            success: function(data) {
                data.forEach(function(element) {
                    app.defaults.items[element.qrcode] = element.item;
                });
            },
            error: function(xhr, type){
                console.log("Fail!");
            }
        });
    },
    render: function(type) {
        var context = null;
        switch (type) {
            case "logger":
                var logs = app.get_loggers();
                console.log(logs);
                context = {title : "Logger"};
                app.ctlMap.container.html(app.template.logger(context));
                break;
            case "beacon":
                context = {title : "Beacon"};
                app.ctlMap.container.html(app.template.beacon(context));
                context = (localStorage["nearest"]) ? JSON.parse(localStorage["nearest"]) : {};
                $("#div-nearest").html(app.template.nearest(context));
                context = (localStorage["rssi"]) ? { rssi: JSON.parse(localStorage["rssi"])} : {rssi:[]};
                $("#div-rssi").html(app.template.rssi(context));
                $("#div-rssi > tr:first-child").addClass("info");
                break;
            case "scale":
                context = (localStorage["scale"]) ? JSON.parse(localStorage["scale"]) : {};
                app.ctlMap.container.html(app.template.scale(context));
                break;
            case "qrcode":
                context = (localStorage["qrcode"]) ? JSON.parse(localStorage["qrcode"]) : {};
                app.ctlMap.container.html(app.template.qrcode(context));
                break;
            default:
                app.get_beacons();
                app.get_items();
                context = {title: "Welcome"};
                app.ctlMap.container.html(app.template.default(context));
        }
    },

    bindEvent: function() {
        console.log("bindEvent");

        $(document).on("click", "#btn-export", function(){
            alert("TODO");
        });
        
        $(document).on("mqttchange", function(e, type, obj) {
            var context = null;
            switch (type) {
                case "logger":
                    //context = (localStorage["logger"]) ? JSON.parse(localStorage["logger"]) : [];
                    //obj = JSON.parse(obj);
                    break;
                case "scale":
                    context = { scale: obj, time: new Date().toLocaleString() };
                    localStorage.setItem("scale", JSON.stringify(context));
                    break;
                case "qrcode":
                    context = { 
                        payload: (typeof app.defaults.items[obj] == "undefined") ? obj : app.defaults.items[obj], 
                        time: new Date().toLocaleString() 
                    };
                    localStorage.setItem("qrcode", JSON.stringify(context));
                    break;
                case "nearest":
                    var nearest = JSON.parse(obj);                 
                    context = { 
                        id: (typeof app.defaults.beacons[nearest.id] == "undefined") ? nearest.id : app.defaults.beacons[nearest.id], 
                        val: nearest.val, 
                        time: new Date().toLocaleString() 
                    };
                    localStorage.setItem("nearest", JSON.stringify(context));
                    type = "beacon";
                    break;
                case "rssi": // append new rssi to object array (limit 30)
                    context = (localStorage["rssi"]) ? JSON.parse(localStorage["rssi"]) : [];
                    obj = JSON.parse(obj);
                    obj.time = new Date().toLocaleString();
                    obj.id = (typeof app.defaults.beacons[obj.id] == "undefined") ? obj.id : app.defaults.beacons[obj.id];
                    context.unshift(obj);
                    localStorage.setItem("rssi", JSON.stringify(context.slice(0, 30)));
                    type = "beacon";
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