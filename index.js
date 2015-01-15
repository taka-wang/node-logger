/**
 * @node-logger
 *
*/

var express    = require("express")           // call express
    , app        = express()                  // define our app using express
    , server     = require("http").Server(app) 
    , bodyParser = require("body-parser") 
    , moment     = require("moment") 
    , config     = require("./config.json") 
    , mqtt       = require('mqtt') 
    //, db         = require("./db") 
    //, Log        = require("./model/log")

var log = {
    scale : "",
    nearest: "",
    qrcode: ""
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || config.web_port; // set our port
server.listen(port, function(){
    console.log("server on port " + port);
});

// Allow CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use(express.static(__dirname + "/public"));

//routes for api
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    console.log("Something is happening.");
    next();
});

router.route("/hello")
    .get(function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(log));
    });

//prefix router with /api
app.use("/api", router);

/********************************************/

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


