const Attendance = require("../models/Attendance");


// MARK ATTENDANCE (Faculty)
exports.markAttendance = async (req, res) => {

    try {

        const { studentId, subjectId, status, date } = req.body;

        const attendance = await Attendance.create({
            student: studentId,
            subject: subjectId,
            status,
            date
        });

        res.status(201).json({
            message: "Attendance marked",
            attendance
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET STUDENT ATTENDANCE
exports.getStudentAttendance = async (req, res) => {

    try {

        const studentId = req.user.id;

        const attendance = await Attendance.find({
            student: studentId
        })
        .populate("subject", "name code");

        res.json(attendance);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET ATTENDANCE PERCENTAGE
exports.getAttendancePercentage = async (req, res) => {

    try {

        const studentId = req.user.id;
        const subjectId = req.params.subjectId;

        const total = await Attendance.countDocuments({
            student: studentId,
            subject: subjectId
        });

        const present = await Attendance.countDocuments({
            student: studentId,
            subject: subjectId,
            status: "present"
        });

        const percentage = total === 0 ? 0 : (present / total) * 100;

        res.json({
            total,
            present,
            percentage: percentage.toFixed(2)
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};