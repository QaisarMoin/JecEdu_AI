const Subject = require("../models/Subject");
const User = require("../models/User");


// CREATE SUBJECT (Admin)
exports.createSubject = async (req, res) => {

    try {

        const { name, code, faculty, department, semester } = req.body;

        const subject = await Subject.create({
            name,
            code,
            faculty,
            department: department || "IT",
            semester
        });

        res.status(201).json({
            message: "Subject created successfully",
            subject
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// GET ALL SUBJECTS (Admin) — supports query filters
exports.getAllSubjects = async (req, res) => {

    try {

        const filter = {};

        if (req.query.department) {
            filter.department = req.query.department;
        }

        if (req.query.semester) {
            filter.semester = parseInt(req.query.semester);
        }

        const subjects = await Subject.find(filter)
            .populate("faculty", "name email");

        res.json(subjects);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// GET FACULTY SUBJECTS
exports.getFacultySubjects = async (req, res) => {

    try {

        const subjects = await Subject.find({
            faculty: req.user.id
        }).populate("faculty", "name email");

        res.json(subjects);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// GET STUDENT SUBJECTS
exports.getStudentSubjects = async (req, res) => {

    try {

        const studentId = req.user.id;
        
                // Fetch full student from DB
                const student = await User.findById(studentId);
        
                if (!student) {
                    return res.status(404).json({
                        message: "Student not found"
                    });
                }
        // console.log(req.user.department + req.user.semester)
        const subjects = await Subject.find({
            department: student.department,
            semester: student.semester
        }).populate("faculty", "name email");

        res.json(subjects);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};