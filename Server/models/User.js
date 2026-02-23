const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "faculty", "student"],
        required: true
    },

    // student-specific fields
    rollNo: {
        type: String,
        unique: true,
        sparse: true
    },

    department: {
        type: String
    },

    semester: {
        type: Number
    },

    // faculty-specific fields (future safe)
    facultyId: {
        type: String,
        sparse: true
    }


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
