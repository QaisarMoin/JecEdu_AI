const mongoose = require("mongoose");

const timetableWeekSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    timeSlots: [
      {
        label: String,
        start: String,
        end: String,
        isLunch: { type: Boolean, default: false },
      },
    ],
    includeSaturday: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
    clonedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableWeek",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

timetableWeekSchema.index(
  { department: 1, semester: 1, weekStartDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("TimetableWeek", timetableWeekSchema);