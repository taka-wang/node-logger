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

var MQTT = {
    client,
    options : {
        timeout: config.timeout,
        useSSL: config.useTLS,
        cleanSession: config.cleansession,
        onSuccess: MQTT.onConnect,
        onFailure: function (message) {
            setTimeout(MQTT.connect, config.reconnectTimeout);
        }
    },
    connect : function() {
        MQTT.client = new Paho.MQTT.Client(
                    window.location.hostname,
                    config.port,
                    "web_" + parseInt(Math.random() * 100,
                    10));
        MQTT.client.onConnectionLost = MQTT.onConnectionLost;
        MQTT.client.onMessageArrived = MQTT.onMessageArrived;
        if (config.username != null) {
            MQTT.options.userName = config.username;
            MQTT.options.password = config.password;
        }
        console.log("connecting");
        MQTT.client.connect(MQTT.options);
    },
    onConnect : function() {
        MQTT.client.subscribe(config.topic, {qos: 0});
    },
    onConnectionLost: function(response) {
        console.log(response);
        setTimeout(MQTT.connect, config.reconnectTimeout);
    },
    onMessageArrived: function(message) {
        var topic = message.destinationName;
        var payload = message.payloadString;
        console.log(topic + " : " + payload);
    }
}


$(function(){
    app.init();
    MQTT.connect();
});