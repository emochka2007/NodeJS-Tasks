const mongoose = require("mongoose");

const Timer = new mongoose.Schema({
  start: { type: Number },
  end_time: { type: Number },
  duration: { type: Number },
  description: { type: String },
  isActive: { type: String },
  _id: { type: String },
});

module.exports = mongoose.model("Timer", Timer);
