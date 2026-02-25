const mongoose = require("mongoose");

const timetableEntrySchema = new mongoose.Schema(
  {
    timetableWeek: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableWeek",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: String,
    semester: Number,
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },
    slotIndex: {
      type: Number,
      required: true,
    },
    startTime: String,
    endTime: String,
    room: { type: String, default: "" },
    isManual: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

timetableEntrySchema.index(
  { timetableWeek: 1, day: 1, slotIndex: 1 },
  { unique: true }
);

module.exports = mongoose.model("TimetableEntry", timetableEntrySchema);