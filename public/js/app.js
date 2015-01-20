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
    client: null,
    options : {
        timeout: config.timeout,
        useSSL: config.useTLS,
        cleanSession: config.cleansession,
        onSuccess: this.onConnect,
        onFailure: function (message) {
            setTimeout(this.connect, config.reconnectTimeout);
        }
    },
    connect : function() {
        this.client = new Paho.MQTT.Client(
                    window.location.hostname,
                    config.port,
                    "web_" + parseInt(Math.random() * 100,
                    10));
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived;
        if (config.username != null) {
            this.options.userName = config.username;
            this.options.password = config.password;
        }
        console.log("connecting");
        this.client.connect(this.options);
    },
    onConnect : function() {
        this.client.subscribe(config.topic, {qos: 0});
    },
    onConnectionLost: function(response) {
        console.log(response);
        setTimeout(this.connect, config.reconnectTimeout);
    },
    onMessageArrived: function(message) {
        var topic = message.destinationName;
        var payload = message.payloadString;
        console.log(topic + " : " + payload);
    }
};


$(function(){
    app.init();
    MQTT.connect();
});