const Attendance = require("../models/Attendance");
const Subject = require("../models/Subject");
const User = require("../models/User");


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

// MARK FULL CLASS ATTENDANCE
exports.markClassAttendance = async (req, res) => {

    try {

        const { subjectId, date, attendance } = req.body;

        // Check if attendance already exists for this subject and date
        const existingAttendance = await Attendance.findOne({
            subject: subjectId,
            date: new Date(date)
        });

        if (existingAttendance) {

            return res.status(400).json({
                message:
                "Attendance for this subject has already been marked!"
            });

        }

        // attendance = array of students

        const records = attendance.map(item => ({
            student: item.studentId,
            subject: subjectId,
            status: item.status,
            date
        }));

        await Attendance.insertMany(records);

        res.status(201).json({
            message: "Class attendance marked successfully",
            count: records.length
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.checkAttendanceStatus = async (req, res) => {

    try {

        const { subjectId, date } = req.query;

        const existing = await Attendance.findOne({
            subject: subjectId,
            date: new Date(date)
        });

        res.json({
            alreadyMarked: !!existing
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.getSubjectAttendance = async (req, res) => {

    try {

        const subjectId = req.params.subjectId;

        const attendance = await Attendance.find({
            subject: subjectId
        }).populate("student", "name email rollNo")

        res.json(attendance);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// GET attendance history by subject
exports.getAttendanceHistory = async (req, res) => {

    try {

        const subjectId = req.params.subjectId;

        const attendance = await Attendance.find({
            subject: subjectId
        })
        .populate("student", "name email rollNo")
        .sort({ date: -1 });

        // group by date
        const grouped = {};

        attendance.forEach(record => {

            const date = record.date.toISOString().split("T")[0];

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(record);

        });

        res.json(grouped);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// UPDATE attendance
exports.updateAttendance = async (req, res) => {

    try {

        const { attendance } = req.body;

        for (let record of attendance) {

            await Attendance.findByIdAndUpdate(
                record._id,
                { status: record.status }
            );

        }

        res.json({
            message: "Attendance updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.getSubjectAnalytics = async (req, res) => {

    try {

        const subjectId = req.params.subjectId;

        const total = await Attendance.countDocuments({
            subject: subjectId
        });

        const present = await Attendance.countDocuments({
            subject: subjectId,
            status: "present"
        });

        const absent = total - present;

        const percentage =
            total === 0 ? 0 : ((present / total) * 100).toFixed(2);

        res.json({
            total,
            present,
            absent,
            percentage
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// STUDENT ATTENDANCE SUMMARY
exports.getStudentAttendanceSummary = async (req, res) => {

    try {

        const studentId = req.user.id;

        // Fetch full student from DB
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        console.log("Student department:", student.department);
        console.log("Student semester:", student.semester);

        const subjects = await Subject.find({
            department: student.department,
            semester: student.semester
        });

        const summary = [];

        for (let subject of subjects) {

            const total = await Attendance.countDocuments({
                student: studentId,
                subject: subject._id
            });

            const present = await Attendance.countDocuments({
                student: studentId,
                subject: subject._id,
                status: "present"
            });

            const absent = total - present;

            const percentage =
                total === 0 ? 0 : ((present / total) * 100).toFixed(2);

            summary.push({
                subjectId: subject._id,
                subjectName: subject.name,
                subjectCode: subject.code,
                total,
                present,
                absent,
                percentage
            });

        }

        res.json(summary);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};