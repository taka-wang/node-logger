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


var client  = mqtt.connect('mqtt://broker.mqttdashboard.com');

client.on("connect", function(){
    client.subscribe("/lab3/#", function(){
        client.on("message", function(topic, payload, packet){
            console.log("Received '" + payload + "' on '" + topic + "'");
            switch (topic) {
                case "/qr/":
                    log["qrcode"] = payload.toString();
                    break;
                case "/ble/nearest/":
                    log["nearest"] = payload.toString();
                    break;
                default:
                    break;
            }
            client.publish("/log/", "hello world", function(){
                console.log("message is published");
            });
        });
    });

});


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})