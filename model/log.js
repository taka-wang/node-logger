/**
 * @Log
 *
*/
var mongoose     = require("mongoose");
var Schema       = mongoose.Schema;

var LogSchema   = new Schema({
    qrcode: String,
    nearest: String,
    scale: Number,
    //created_at: Number,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", LogSchema);