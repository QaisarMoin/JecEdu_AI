const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({

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

    mst1Marks: {
        type: Number,
        default: 0
    },

    mst2Marks: {
        type: Number,
        default: 0
    },

    assignmentMarks: {
        type: Number,
        default: 0
    },

    practicalMarks: {
        type: Number,
        default: 0
    },

    mstBest: {
        type: Number,
        default: 0
    },

    totalMarks: {
        type: Number,
        default: 0
    }

}, { timestamps: true });


markSchema.index(
    { student: 1, subject: 1 },
    { unique: true }
);

module.exports = mongoose.model("Mark", markSchema);