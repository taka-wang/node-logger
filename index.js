/**
 * @node-logger
 * @author Taka Wang
*/

var express      = require("express")               // call express
    , app        = express()                        // define our app using express
    , server     = require("http").Server(app) 
    , bodyParser = require("body-parser") 
    , config     = require("./config.json") 
    , port       = process.env.PORT || config.web_port
    , router     = express.Router()                 //routes for api
    , Log        = require("./model/log")
    , Beacon     = require("./model/beacon")
    , Item       = require("./model/item")
    , db         = require("./db") 
    , latest     = {
        scale: 0,
        nearest: "",
        qrcode:  ""
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
    console.log("Server on port " + port);
});

/**********************************************************************
* Restful API router
**********************************************************************/

router.route("/")
    .all(function(req, res) {
        res.json({ message: "API works" });
    });

router.route("/items")
    // read a list of items
    .get(function(req, res) {
        return Item.find(function(err, items) {
            if (!err) {
                res.json(items);
            } else {
                res.json(400, { message: "Fail to get items" });
            }
        });
    })
    // create a single item
    .post(function(req, res) {
        if (req.body.qrcode && req.body.item) {
            var item = new Item({
                qrcode: req.body.qrcode,
                item:   req.body.item,
            });
            item.save(function(err) {
                if (!err) {
                    res.json(201, { message: "Item created" });
                } else {
                    res.json(400, { message: err });
                }
            });
        } else {
            res.json(400, { message: "Bad request" });
        }
    });

router.route("/items/:qrcode")
    // read a single item by id
    .get(function(req, res) {
        return Item.findOne({ "qrcode" : req.params.qrcode}, function(err, item) {
            if (item) {
                if (!err) {
                    res.json(item);
                } else {
                    res.json(400, { message: err });
                }
            } else {
                res.json(404, { message: "Not found"});
            }
        })
    })
    // update a single item by id
    .put(function(req, res) {
        return Item.findOne({ "qrcode" : req.params.qrcode}, function(err, item) {
            if (item && req.body.item) {
                item.item = req.body.item;
                return item.save(function(err) {
                    if (!err) {
                        res.json({ message: "Item updated" });
                    } else {
                        res.json(200, { message: err });
                    }
                });
            } else {
                res.json(400, { message: "Bad request" });
            }
        })
    })
    // delete a single item by id
    .delete(function(req, res) {
        return Item.findOne({ "qrcode" : req.params.qrcode}, function(err, item) {
            if (item) {
                return item.remove(function(err) {
                    if (!err) {
                        res.json({ message: "Item deleted" });
                    } else {
                        res.json(200, { message: err });
                    }
                });
            } else {
                res.json(404, { message: "Not found" });
            }
        });
    });

router.route("/beacons")
    // read a list of beacons
    .get(function(req, res) {
        return Beacon.find(function(err, beacons) {
            if (!err) {
                res.json(beacons);
            } else {
                res.json(400, { message: "Fail to get beacons" });
            }
        });
    })
    // create a single beacon
    .post(function(req, res) {
        if (req.body.name && req.body.id) {
            var beacon = new Beacon({
                name: req.body.name,
                id: req.body.id
            });
            beacon.save(function(err) {
                if (!err) {
                    res.json(201, { message: "Beacon created" });
                } else {
                    res.json(400, { message: err });
                }
            });
        } else {
            res.json(400, { message: "Bad request" });
        }
    });

router.route("/beacons/:id")
    // read a single beacon by id
    .get(function(req, res) {
        return Beacon.findOne({ "id" : req.params.id }, function(err, beacon) {
            if (beacon) {
                if (!err) {
                    res.json(beacon);
                } else {
                    res.json(400, { message: err });
                }
            } else {
                res.json(404, { message: "Not found"});
            }
        });
    })
    // update a single beacon by id
    .put(function(req, res) {
        return Beacon.findOne({ "id" : req.params.id }, function(err, beacon) {
            if (beacon && req.body.name) {
                beacon.name = req.body.name;
                return beacon.save(function(err) {
                    if (!err) {
                        res.json({ message: "Beacon updated" });
                    } else {
                        res.json(200, { message: err });
                    }
                });
            } else {
                res.json(400, { message: "Bad request" });
            }
        });

    })
    // delete a single beacon by id
    .delete(function(req, res) {
        return Beacon.findOne({ "id" : req.params.id }, function(err, beacon) {
            if (beacon) {
                return beacon.remove(function(err) {
                    if (!err) {
                        res.json({ message: "Beacon deleted" });
                    } else {
                        res.json(200, { message: err });
                    }
                });
            } else {
                res.json(404, { message: "Not found" });
            }
        });
    });

router.route("/logs")
    // read a list of logs
    .get(function(req, res) {
        if (req.query.start && req.query.end) { // date range: new Date().toISOString()
            return Log.find({created_at: { $gte: req.query.start, $lt: req.query.end }}, function(err, logs) {
                if (!err) {
                    res.json(logs);
                } else {
                    res.json(400, { message: "Fail to get logs" });
                }
            });
        } else { // all
            var q = Log.find({}).sort("-created_at").limit(1000);
            return q.execFind(function(err, logs) {
                if (!err) {
                    res.json(logs);
                } else {
                    res.json(400, { message: "Fail to get logs" });
                }
            });
        }
    })

router.route("/reboot")
    .post(function(req, res) {
        var exec = require('child_process').exec;
        function execute(command, callback) {
            exec(command, function(error, stdout, stderr) { callback(stdout); });
        }
        execute("/sbin/reboot", function(callback){
            res.json({ message: "rebooting.." });
        });
    })
