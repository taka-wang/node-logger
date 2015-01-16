/**
 * @db connection
 * @author Taka Wang
*/
var mongoose   = require('mongoose');
var url = "mongodb://test:test@ds031611.mongolab.com:31611/lab3";
var url2= 'mongodb://localhost/test';
mongoose.connect(url,
    function(err, res) {
      if (err) {
        console.log('error connect to mongodb. ' + err);
      } else {
        console.log('Connected to mongodb');
      }
}); // connect to mongodb