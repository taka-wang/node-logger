/**
 * @node-logger
 * @author Taka Wang
*/

var mqtt         = require("mqtt") 
    , config     = require("./config.json") 
    , mqttclnt   = mqtt.connect({ host: config.mqtt_server, port: config.mqtt_port })
    , Log        = require("./model/log")
    , Beacon     = require("./model/beacon")
    , Item       = require("./model/item")
    , db         = require("./db") 
    , latest     = {
        scale: 0,
        nearest: "",
        qrcode: ""
    }

mqttclnt.on("connect", function(){
    console.log("connected to mqtt broker");
    mqttclnt.subscribe(config.topic_sub, function(){
        mqttclnt.on("message", function(topic, payload, packet){
            //console.log("Received '" + payload + "' on '" + topic + "'");
            switch (topic) {
                case config.topic_qr:
                    latest["qrcode"] = payload.toString();
                    break;
                case config.topic_nearest:
                    var nearest = JSON.parse(payload.toString());
                    latest["nearest"] = nearest.id;
                    break;
                case config.topic_scale:
                    latest["scale"] = payload.toString();
                    if (config.tainan) { // publish new log
                        mqttclnt.publish(config.topic_log, JSON.stringify(latest), function(){
                            console.log("pub");
                        });
                    }
                    break;
                case config.topic_log: // write log to mongo
                    var clog = new Log(JSON.parse( payload.toString() ));
                    clog.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    break;
                default:
                    //do nothing
                    break;
            }
        });
    });
});


