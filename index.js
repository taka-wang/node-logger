/**
 * @node-logger
 * @author Taka Wang
*/

var express      = require("express")               // call express
    , app        = express()                        // define our app using express
    , server     = require("http").Server(app) 
    , bodyParser = require("body-parser") 
    , moment     = require("moment") 
    , mqtt       = require("mqtt") 
    , config     = require("./config.json") 
    , port       = process.env.PORT || config.web_port
    , router     = express.Router()                 //routes for api
    , mqttclnt   = mqtt.connect({ host: config.mqtt_server, port: config.mqtt_port })
    , Log        = require("./model/log")
    , Beacon     = require("./model/beacon")
    , Item       = require("./model/item")
//    , db         = require("./db") 
    , latest     = {
        scale: 0,
        nearest: "",
        qrcode: ""
    }

/**********************************************************************
* Express Setup
**********************************************************************/

app.disable("x-powered-by");
app.disable("etag");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public")); // serve static files
app.use("/api", router);                        // prefix router with /api
app.use(function(req, res, next) {              // Allow CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
server.listen(port, function(){
    console.log("server on port " + port);
});

/**********************************************************************
* Restful API router
**********************************************************************/

router.get("/", function(req, res) {
    res.json({ message: "Hello! API works" });  
});

router.route("/hello")
    .get(function(req, res) {
        //res.setHeader("Content-Type", "application/json");
        //res.end(JSON.stringify(latest));
        res.json(latest);
    });

router.route("/items")
    // read a list of items
    .get(function(req, res) {
        return Item.find(function(err, items) {
            if (!err) {
                return json(items);
            } else {
                res.json(200, { message: "fail to get items" });
            }
        });
    })
    // create a single item
    .post(function(req, res) {
        var item = new Item({
            "qrcode": "hello",
            "item": "world"
        });
        item.save(function(err) {
            if (!err) {
                res.json({ message: "created" });
            } else {
                res.json(200, { message: err });
            }
        });
    });

router.route("/items/:id")
    // read a single item by id
    .get(function(req, res) {
        return Item.findById(req.params.item, function(err, item) {
            if (!err) {
                res.json(item);
            } else {
                res.json(200, { message: err });
            }
        })
    })
    // update a single item by id
    .put(function(req, res) {
        return Item.findById(req.params.item, function(err, item) {
            item.qrcode = req.body.qrcode;
            return item.save(function(err) {
                if (!err) {
                    res.json({ message: "updated" });
                } else {
                    res.json(200, { message: err });
                }
            })
        })
    })
    // delete a single item by id
    .delete(function(req, res) {
        return Item.findById(req.params.item, function(err, item) {
            return item.remove(function(err) {
                if (!err) {
                    res.json({ message: "deleted" });
                } else {
                    res.json(200, { message: err });
                }
            });
        });
    });

router.route("/beacons")
    // read a list of beacons
    .get(function(req, res) {
        return Beacon.find(function(err, beacons) {
            if (!err) {
                res.json(beacons);
            } else {
                res.json(200, { message: "fail to get beacons" });
            }
        });
    })
    // create a single beacon
    .post(function(req, res) {
        var beacon = new Beacon({
            "name": "hello",
            "id": "world"
        });
        beacon.save(function(err) {
            if (!err) {
                res.json({ message: "created" });
            } else {
                res.json(200, { message: err });
            }
        });
    });

router.route("/beacons/:id")
    // read a single beacon by id
    .get(function(req, res) {
        return Beacon.findById(req.params.id, function(err, beacon) {
            if (!err) {
                res.json(beacon);
            } else {
                res.json(200, { message: err });
            }
        });
    })
    // update a single beacon by id
    .put(function(req, res) {
        return Beacon.findById(req.params.id, function(err, beacon) {
            beacon.name = req.body.name;
            return beacon.save(function(err) {
                if (!err) {
                    res.json({ message: "updated" });
                } else {
                    res.json(200, { message: err });
                }
            });
        });

    })
    // delete a single beacon by id
    .delete(function(req, res) {
        return Beacon.findById(req.params.id, function(err, beacon) {
            return beacon.remove(function(err) {
                if (!err) {
                    res.json({ message: "deleted" });
                } else {
                    res.json(200, { message: err });
                }
            });
        });
    });

/**********************************************************************
* MQTT
**********************************************************************/

mqttclnt.on("connect", function(){
    console.log("connected");
    mqttclnt.subscribe(config.topic_sub, function(){
        mqttclnt.on("message", function(topic, payload, packet){
            console.log("Received '" + payload + "' on '" + topic + "'");
            switch (topic) {
                case config.topic_qr:
                    latest["qrcode"] = payload.toString();
                    break;
                case config.topic_nearest:
                    latest["nearest"] = payload.toString();
                    break;
                case config.topic_scale:
                    latest["scale"] = payload.toString();
                    
                    if (config.tainan) { // publish new log
                        mqttclnt.publish(config.topic_log, JSON.stringify(latest), function(){
                            console.log("pub");
                        });
                    }
                    break;
                case config.topic_log:
                    // write log to mongo
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


