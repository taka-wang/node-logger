/**
 * @Lab frontend
 * @author Taka Wang
 *
*/
var app = {
    defaults: {
        active:  "",
        beacons: {},
        items:   {},
        logs:    []
    },
    ctlMap : {
        container:  $("#container"),
        logger:     $("#logger_list"),
        beacon:     $("#beacon_list"),
        scale:      $("#scale_list"),
        qrcode:     $("#qrcode_list"),
        bmgr  :     $("#beacon_mgr_list"),
        qmgr  :     $("#qrcode_mgr_list")
    },
    template : {
        default: Handlebars.compile($("#default-template").html()),
        logger:  Handlebars.compile($("#logger-template").html()),
        beacon:  Handlebars.compile($("#beacon-template").html()),
        nearest: Handlebars.compile($("#nearest-template").html()),
        rssi:    Handlebars.compile($("#rssi-template").html()),
        scale:   Handlebars.compile($("#scale-template").html()),
        qrcode:  Handlebars.compile($("#qrcode-template").html()),
        bmgr:    Handlebars.compile($("#beacon-mgr-template").html()),
        qmgr:    Handlebars.compile($("#qrcode-mgr-template").html())
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
    get_loggers: function(callback) {
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
                    delete data[i]._id;
                    delete data[i].__v;
                }
                if (callback) callback({log: data});
                data.unshift({"scale": "Scale (g)", "nearest": "Who", "qrcode": "Item", "created_at": "Time"});
                app.defaults.logs = data;
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
    json2csv: function(JSONData, ReportTitle, ShowLabel) {
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;      
        var CSV = '';    
        if (ShowLabel) {
            var row = "";         
            for (var index in arrData[0]) {
                row += index + ',';
            }
            row = row.slice(0, -1);           
            CSV += row + '\r\n';
        }
        for (var i = 0; i < arrData.length; i++) { //row
            var row = "";
            for (var index in arrData[i]) { //col
                row += '"' + arrData[i][index] + '",';
            }
            row.slice(0, row.length - 1);
            CSV += row + '\r\n'; //add a line break after each row
        }
        if (CSV == '') {        
            alert("Invalid data");
            return;
        }   
        
        //Generate a file name
        var fileName = "D2D_";
        fileName += ReportTitle.replace(/ /g,"_");           
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);        
        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");    
        link.href = uri;
        
        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        
        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    render: function(type) {
        var context = null;
        switch (type) {
            case "logger":
                var logs = app.get_loggers(function(context) {
                    app.ctlMap.container.html(app.template.logger(context));
                });
                break;
            case "beacon":
                context = {title : "Beacon"};
                app.ctlMap.container.html(app.template.beacon(context));
                context = (localStorage["nearest"]) ? JSON.parse(localStorage["nearest"]) : {};
                $("#div-nearest").html(app.template.nearest(context));
                context = (localStorage["rssi"]) ? { rssi: JSON.parse(localStorage["rssi"])} : {rssi:[]};
                $("#div-rssi").html(app.template.rssi(context));
                break;
            case "scale":
                context = (localStorage["scale"]) ? JSON.parse(localStorage["scale"]) : {};
                app.ctlMap.container.html(app.template.scale(context));
                break;
            case "qrcode":
                context = (localStorage["qrcode"]) ? JSON.parse(localStorage["qrcode"]) : {};
                app.ctlMap.container.html(app.template.qrcode(context));
                break;
            case "bmgr":
                context = {title: "BMGR"};
                app.ctlMap.container.html(app.template.bmgr(context));
                break;
            case "qmgr": //QRCODE item
                context = {title: "Item Management", item: []};
                var idx = 0;
                for (var key in app.defaults.items) {
                    if (app.defaults.items.hasOwnProperty(key)) {
                        context.item.push({"qrcode": key, "item": app.defaults.items[key], "idx": "btn-qr-"+idx })
                    }
                    idx++;
                }
                app.ctlMap.container.html(app.template.qmgr(context));
                $("[id^=btn-qr-]").click(function() {
                    console.log($(this).attr('id'));
                });
                $("#tbl-item").editableTableWidget();
                $("#tbl-item td").on("change", function(evt, newVale) {
                    if (evt.target.cellIndex == 0) return false; // reject change
                    console.log(evt);
                    console.log(evt.target.cellIndex);
                    console.log(newVale);
                    console.log($(this).parent().parent().children().index($(this).parent()));
                });
                break;
            default:
                app.get_beacons();
                app.get_items();
                context = {title: "Welcome to D2D"};
                app.ctlMap.container.html(app.template.default(context));
        }
    },

    bindEvent: function() {
        console.log("bindEvent");
        $(document).on("click", "#btn-export", function(){
            app.json2csv(app.defaults.logs, new Date().toISOString(), false);
        });
        

        $("#btn-save-item").click(function() {
            console.log($("#inputQR").val());
            console.log($("#inputItem").val());
            $("#itemModal").modal("toggle");
        });

        $(document).on("mqttchange", function(e, type, obj) {
            var context = null;
            switch (type) {
                case "logger":
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
        app.ctlMap.bmgr.click(function() {
            $(document).trigger("pagechange", ["bmgr", $(this)]);
        });
        app.ctlMap.qmgr.click(function() {
            $(document).trigger("pagechange", ["qmgr", $(this)]);
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