/**
 * @db connection
 * @author Taka Wang
*/
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/test',
    function(err, res) {
      if (err) {
        console.log('error connect to mongodb. ' + err);
      } else {
        console.log('Connected to mongodb');
      }
}); // connect to mongodb