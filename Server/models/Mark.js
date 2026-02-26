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
        default: null
    },

    mst2Marks: {
        type: Number,
        default: null
    },

    assignmentMarks: {
        type: Number,
        default: null
    },

    practicalMarks: {
        type: Number,
        default: null
    },

    mstBest: {
        type: Number,
        default: null
    },

    totalMarks: {
        type: Number,
        default: null
    },

    mst1Locked: {
        type: Boolean,
        default: false
    },

    mst2Locked: {
        type: Boolean,
        default: false
    },

    assignmentLocked: {
        type: Boolean,
        default: false
    },

    practicalLocked: {
        type: Boolean,
        default: false
    },

    publishedComponents: {
        type: [String],
        enum: ["mst1", "mst2", "assignment", "practical"],
        default: []
    },

    remarks: {
        type: String,
        default: ""
    }

}, { timestamps: true });


markSchema.index(
    { student: 1, subject: 1 },
    { unique: true }
);


// Static method to calculate and update
// mstBest and totalMarks
markSchema.statics.calculateAndUpdate =
    async function (studentId, subjectId) {

    const mark = await this.findOne({
        student: studentId,
        subject: subjectId
    });

    if (!mark) return null;

    // Calculate mstBest
    let mstBest = null;

    if (
        mark.mst1Marks !== null &&
        mark.mst2Marks !== null
    ) {
        mstBest = Math.max(
            mark.mst1Marks,
            mark.mst2Marks
        );
    } else if (mark.mst1Marks !== null) {
        mstBest = mark.mst1Marks;
    } else if (mark.mst2Marks !== null) {
        mstBest = mark.mst2Marks;
    }

    // Calculate totalMarks from available components
    let total = 0;
    let hasAny = false;

    if (mstBest !== null) {
        total += mstBest;
        hasAny = true;
    }
    if (mark.assignmentMarks !== null) {
        total += mark.assignmentMarks;
        hasAny = true;
    }
    if (mark.practicalMarks !== null) {
        total += mark.practicalMarks;
        hasAny = true;
    }

    const totalMarks = hasAny ? total : null;

    // Update the document directly
    await this.updateOne(
        { _id: mark._id },
        { $set: { mstBest, totalMarks } }
    );

    return { mstBest, totalMarks };
};


module.exports = mongoose.model("Mark", markSchema);