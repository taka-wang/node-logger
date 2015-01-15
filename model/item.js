/**
 * @Item
 * @author Taka Wang
*/
var mongoose     = require("mongoose");
var Schema       = mongoose.Schema;

var ItemSchema   = new Schema({
    qrcode: String,
    item: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", ItemSchema);