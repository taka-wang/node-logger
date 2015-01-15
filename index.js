var config = require("./config.json");
var express = require('express');
var app = express();
var mqtt = require('mqtt');
var log = {
    scale : "",
    nearest: "",
    qrcode: ""
}

app.get('/hello', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(log));
  
});

var client  = mqtt.connect({ host: config.mqtt_server, port: config.mqtt_port });

client.on("connect", function(){
    console.log("connected");
    client.subscribe(config.topic_sub, function(){
        client.on("message", function(topic, payload, packet){
            console.log("Received '" + payload + "' on '" + topic + "'");
            switch (topic) {
                case config.topic_qr:
                    log["qrcode"] = payload.toString();
                    break;
                case config.topic_nearest:
                    log["nearest"] = payload.toString();
                    break;
                case config.topic_scale:
                    log["scale"] = payload.toString();
                    if (config.tainan) {
                        client.publish(config.topic_log, "hello world", function(){
                            console.log("message is published");
                        });
                    }
                    break;
                case config.topic_log:
                    //write to db
                    break;
                default:
                    break;
            }
        });
    });

});


var server = app.listen(config.web_port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('app listening at http://%s:%s', host, port)

})
