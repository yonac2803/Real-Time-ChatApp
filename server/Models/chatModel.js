const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    members: Array,
},{
    timestamps: true,
});

const chatModel = mongoose.model("Caht", chatSchema);

module.exports = chatModel;