/**
 * @mqtt lib
 * @author Taka Wang
 * depend on mqttws31.js and config.js
*/
var mqtt = {
    client: null,
    connect : function() {    
        this.client = new Paho.MQTT.Client(
                    window.location.hostname,
                    config.port,
                    "web_" + parseInt(Math.random() * 100,
                    10));
        this.client.onConnectionLost = mqtt.onConnectionLost;
        this.client.onMessageArrived = mqtt.onMessageArrived;
        that = this;
        this.client.connect({
            timeout: config.timeout,
            useSSL: config.useTLS,
            cleanSession: config.cleansession,
            onSuccess: function() {
                that.client.subscribe(config.topic, {qos: 0});
            },
            onFailure: function (message) {
                setTimeout(mqtt.connect, config.reconnectTimeout);
            }
        });
    },
    onConnect : function() {
        //console.log(this.client);
        this.client.subscribe(config.topic, {qos: 0});
    },
    onConnectionLost: function(response) {
        //console.log(response);
        setTimeout(mqtt.connect, config.reconnectTimeout);
    },
    onMessageArrived: function(message) {
        var topic = message.destinationName;
        var payload = message.payloadString;
        console.log(topic + " : " + payload);
        mqtt.handler(topic, payload);       
    },
    // application handler - change here
    handler: function(topic, payload) {
        switch (topic) {
            case "/lab3/scale/":
                $(document).trigger("mqttchange", ["scale", payload]);
                break;
            case "/lab3/qr/":
                $(document).trigger("mqttchange", ["qrcode", payload]);
                break;
            case "/lab3/ble/nearest/":
                $(document).trigger("mqttchange", ["nearest", payload]);
                break;
            case "/lab3/ble/rssi/":
                $(document).trigger("mqttchange", ["rssi", payload]);
                break;
            case "/lab3/log/":
                $(document).trigger("mqttchange", ["logger", payload]);
                break;
            default:
                // do nothing
        }
    }
};