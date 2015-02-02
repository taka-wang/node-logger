/**
 * @Lab frontend
 * @author Taka Wang
 *
*/
var app = {
    defaults: {
        zerocount: 0,
        active:  "",
        beacons: {},
        items:   {},
        logs:    [] // work log
    },
    ctlMap : {
        container:      $("#container"),
        li:             $("ul.sidebar-nav li"),     // nav list
        //
        item_modal:     $("#itemModal"),
        aItemFail:      $("#alert-item-fail"),
        aItemOk:        $("#alert-item-success"),
        inputQR:        $("#inputQR"),
        inputItem:      $("#inputItem"),
        btnSaveItem:    $("#btn-save-item-modal"),  // add new item button
        //
        beacon_modal:   $("#beaconModal"),
        aBeaconFail:    $("#alert-beacon-fail"),
        aBeaconOk:      $("#alert-beacon-success"),
        inputID:        $("#inputID"),
        inputName:      $("#inputName"),
        btnSaveBeacon:  $("#btn-save-beacon-modal") // add new beacon button
    },
    template : {
        default:    Handlebars.compile($("#default-template").html()),
        logger:     Handlebars.compile($("#logger-template").html()),
        beacon:     Handlebars.compile($("#beacon-template").html()),
        nearest:    Handlebars.compile($("#nearest-template").html()),
        rssi:       Handlebars.compile($("#rssi-template").html()),
        scale:      Handlebars.compile($("#scale-template").html()),
        qrcode:     Handlebars.compile($("#qrcode-template").html()),
        beacon_mgr: Handlebars.compile($("#beacon-mgr-template").html()),
        item_mgr:   Handlebars.compile($("#qrcode-mgr-template").html())
    },
    init: function() {
        console.log("init");
        app.clear_storage();
        app.bindEvent();
        $(window).hashchange();
    },
    destroy: function() {
        console.log("destroy");
    },
    clear_storage: function() {
        console.log("clear_storage");
        localStorage.removeItem("nearest");
        localStorage.removeItem("rssi");
        localStorage.removeItem("scale");
        localStorage.removeItem("qrcode");
    },
    get_logs: function(callback) {
        console.log("get_logs");
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
                if (callback) callback({title: "Work Logs", log: data});
                data.unshift({"scale": "Scale (g)", "nearest": "Who", "qrcode": "Item", "created_at": "Time"});
                app.defaults.logs = data;
            },
            error: function(xhr, type){
                console.log("Fail!");
            }
        });
    },
    get_beacons: function(successHandler, errHandler) {
        console.log("get_beacons");
        $.ajax({
            type: "GET",
            timeout: 5000,
            cache: false, // do not cache
            url: "/api/beacons",
            dataType: "json",
            success: successHandler,
            error: errHandler
        });
    },
    add_beacon: function(id, name) {
        console.log("add_beacon");
        $.ajax({
            type: "POST",
            timeout: 5000,
            cache: false, // do not cache
            url: "/api/beacons",
            data: { 
                name: name, 
                id: id
            }
        })
        .done(function(msg) {
            app.ctlMap.aBeaconOk.removeClass("hidden").delay(1000).queue(function(){
                $(this).addClass("hidden").dequeue();
                app.ctlMap.beacon_modal.modal("toggle"); //dismiss
                app.rende("beacon_mgr");
            });
        })
        .fail (function( jqXHR, textStatus ) {
            console.log(textStatus);
            app.ctlMap.aBeaconFail.removeClass("hidden").delay(3000).queue(function(){
                $(this).addClass("hidden").dequeue();
            });
        });
    },
    delete_beacon: function(id, name) {
        console.log("delete_beacon");
        $.ajax({
            type: "DELETE",
            timeout: 5000,
            url: "/api/beacons/" + id,
            success: function(result) {
                delete app.defaults.beacons[id];
                app.rende("beacon_mgr");
            },
            error: function(xhr, type) {
                alert("Fail to delete beacon!");
            }
        });
    },
    update_beacon: function(id, name) {
        console.log("update_beacon");
        $.ajax({
            type: "PUT",
            timeout: 5000,
            url: "/api/beacons/" + id,
            data: { 
                name: name
            },
            success: function(result) {
                app.rende("beacon_mgr");
            },
            error: function(xhr, type) {
                alert("Fail to update beacon!");
            }
        });
    },
    get_items: function(successHandler, errHandler) {
        console.log("get_items");
        $.ajax({
            type: "GET",
            timeout: 5000,
            cache: false, // do not cache
            url: "/api/items",
            dataType: "json",
            success: successHandler,
            error: errHandler
        });
    },
    add_item: function(qrcode, item) {
        console.log("add_item");
        $.ajax({
            type: "POST",
            timeout: 5000,
            cache: false, // do not cache
            url: "/api/items",
            data: { 
                qrcode: qrcode, 
                item: item
            }
        })
        .done(function(msg) {
            app.ctlMap.aItemOk.removeClass("hidden").delay(1000).queue(function(){
                $(this).addClass("hidden").dequeue();
                app.ctlMap.item_modal.modal("toggle"); //dismiss
                app.rende("item_mgr");
            });
        })
        .fail (function( jqXHR, textStatus ) {
            console.log(textStatus);
            app.ctlMap.aItemFail.removeClass("hidden").delay(3000).queue(function(){
                $(this).addClass("hidden").dequeue();
            });
        });
    },
    delete_item: function(qrcode, item) {
        console.log("delete_item");
        $.ajax({
            type: "DELETE",
            timeout: 5000,
            url: "/api/items/" + qrcode,
            success: function(result) {
                delete app.defaults.items[qrcode];
                app.rende("item_mgr");
            },
            error: function(xhr, type) {
                alert("Fail to delete item!");
            }
        });
    },
    update_item: function(qrcode, item) {
        console.log("update_item");
        $.ajax({
            type: "PUT",
            timeout: 5000,
            url: "/api/items/" + qrcode,
            data: { 
                item: item
            },
            success: function(result) {
                app.rende("item_mgr");
            },
            error: function(xhr, type) {
                alert("Fail to update item!");
            }
        });
    },
    json2csv: function(JSONData, ReportTitle, ShowLabel) {
        console.log("json2csv");
        var arrData = typeof JSONData != "object" ? JSON.parse(JSONData) : JSONData;      
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
        var uri = "data:text/csv;charset=utf-8," + escape(CSV);        
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
    rende: function(type) {
        console.log("rende - " + type);
        var context = null;
        if (Object.keys(app.defaults.beacons).length == 0) {
            app.get_beacons(
                function(data) {
                    data.forEach(function(beacon) {
                        app.defaults.beacons[beacon.id] = beacon.name;
                    });
                },
                function(xhr, type) {
                    console.log("Fail!");
                }
            );
        }
        if (Object.keys(app.defaults.items).length == 0) {
            app.get_items(
                function(data) {
                    data.forEach(function(element) {
                        app.defaults.items[element.qrcode] = element.item;
                    });
                }, 
                function(xhr, type){
                    console.log("Fail!");
                }
            );
        }
        switch (type) {
            case "logger":
                var logs = app.get_logs(function(context) {
                    app.ctlMap.container.html(app.template.logger(context));
                    /*
                    //bind datepicker
                    $("#datepicker").datepicker({
                        todayHighlight: true
                    }).on("changeDate", function(ev) {
                        ev.target.name == "start" ? _start = ev.date : _end = ev.date
                        if (_start && _end) {
                            console.log(_start);
                            console.log(_end);
                        }
                    });
                    */
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
            case "item":
                context = (localStorage["qrcode"]) ? JSON.parse(localStorage["qrcode"]) : {};
                app.ctlMap.container.html(app.template.qrcode(context));
                break;
            case "beacon_mgr":
                context = {title: "Beacon Management", beacon: []};
                app.get_beacons(                    
                    function(data) { //success handler
                        for (var i = 0; i < data.length; i++) {
                            data[i].idx = "btn-beacon-" + i;
                            context.beacon.push(data[i]);
                            app.defaults.beacons[data[i].id] = data[i].name; // update array
                        }
                        app.ctlMap.container.html(app.template.beacon_mgr(context));

                        $("#tbl-beacon").editableTableWidget();
                        
                        // DELETE
                        $("[id^=btn-beacon-]").click(function() {
                            var id = $.trim($(this).parent().parent().children().eq(0).html()),
                                name   = $.trim($(this).parent().parent().children().eq(1).html());
                            app.delete_beacon(id, name); // delete item
                        });
                        
                        // UPDATE
                        $("#tbl-beacon td").on("change", function(evt, newValue) {
                            if (evt.target.cellIndex != 1) return false; // reject change
                            var id = $.trim($(evt.target).prev().html());
                            app.update_beacon(id, newValue);
                        });
                    }, 
                    function(xhr, type) { // error handler
                        app.ctlMap.container.html(app.template.beacon_mgr(context));
                    }
                );
                break;
            case "item_mgr": 
                context = {title: "Item Management", item: []};
                app.get_items(                    
                    function(data) { //success handler
                        for (var i = 0; i < data.length; i++) {
                            data[i].idx = "btn-qr-" + i;
                            context.item.push(data[i]);
                            app.defaults.items[data[i].qrcode] = data[i].item; // update array
                        }
                        app.ctlMap.container.html(app.template.item_mgr(context));

                        $("#tbl-item").editableTableWidget();
                        
                        // DELETE
                        $("[id^=btn-qr-]").click(function() {
                            var qrcode = $.trim($(this).parent().parent().children().eq(0).html()),
                                item   = $.trim($(this).parent().parent().children().eq(1).html());
                            app.delete_item(qrcode, item); // delete item
                        });
                        
                        // UPDATE
                        $("#tbl-item td").on("change", function(evt, newValue) {
                            if (evt.target.cellIndex != 1) return false; // reject change
                            var qrcode = $.trim($(evt.target).prev().html());
                            app.update_item(qrcode, newValue);
                        });
                    }, 
                    function(xhr, type) { // error handler
                        app.ctlMap.container.html(app.template.item_mgr(context));
                    }
                );
                break;
            default:
                context = {title: "Dare to Dream"};
                app.ctlMap.container.html(app.template.default(context));
        }
    },
    bindEvent: function() {
        console.log("bindEvent");

        $(document).on("click", "#btn-export", function(){
            app.json2csv(app.defaults.logs, new Date().toISOString(), false);
        });

        app.ctlMap.btnSaveBeacon.click(function() {
            if ( app.ctlMap.inputID.val().length > 0 && app.ctlMap.inputName.val().length > 0 ) {
                app.add_beacon(app.ctlMap.inputID.val(), app.ctlMap.inputName.val());
            } else {
                app.ctlMap.aBeaconFail.removeClass("hidden");
            }
        });
        
        app.ctlMap.btnSaveItem.click(function() {
            if ( app.ctlMap.inputItem.val().length > 0 && app.ctlMap.inputQR.val().length > 0 ) {
                app.add_item(app.ctlMap.inputQR.val(), app.ctlMap.inputItem.val());
            } else {
                app.ctlMap.aItemFail.removeClass("hidden");
            }
        });

        $(document).on("mqttchange", function(e, type, obj) {
            var context = null;
            switch (type) {
                case "logger":
                    break;
                case "scale":
                    if (parseFloat(payload) == 0) {
                        app.defaults.zerocount++;
                    } else {
                        app.defaults.zerocount = 0;
                    }
                    if (app.defaults.zerocount < 2) {
                        context = { scale: obj, time: new Date().toLocaleString() };
                        localStorage.setItem("scale", JSON.stringify(context));
                    }
                    break;
                case "item":
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
            if (app.defaults.active == type) app.rende(type);
        });

        $(window).hashchange(function() {
            app.defaults.active = location.hash.substring(1);
            if (app.defaults.active.length > 0) {
                $("#li_" + app.defaults.active).addClass("active").siblings().removeClass("active");
            } else {
                $("li").removeClass("active");
            }
            app.rende(app.defaults.active);
            console.log("DEBUG: " + location.hash);
        });
    }
};

$(function(){
    app.init();
    mqtt.connect();
});