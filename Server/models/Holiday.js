const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["public", "institutional"],
      default: "institutional",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);