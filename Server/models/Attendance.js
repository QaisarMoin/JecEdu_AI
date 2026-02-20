const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["present", "absent"],
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);