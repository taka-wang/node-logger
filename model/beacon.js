/**
 * @Beacon
 * @author Taka Wang
*/
var mongoose     = require("mongoose");
var Schema       = mongoose.Schema;

var BeaconSchema   = new Schema({
    name: String,
    id: { type : String, unique: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Beacon", BeaconSchema);