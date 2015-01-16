/**
 * @db connection
 * @author Taka Wang
*/
var mongoose    = require('mongoose')
    , config    = require("./config.json")
    , url       = config.mongodb_server

mongoose.connect(url,
    function(err, res) {
      if (err) {
        console.log("Error connect to mongodb. " + err);
      } else {
        console.log("Connected to mongodb");
      }
}); // connect to mongodb