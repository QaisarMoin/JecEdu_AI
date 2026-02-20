const Subject = require("../models/Subject");


// CREATE SUBJECT (Admin)
exports.createSubject = async (req, res) => {

    try {

        const { name, code, faculty, department, semester } = req.body;

        const subject = await Subject.create({
            name,
            code,
            faculty,
            department,
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


// GET ALL SUBJECTS (Admin)
exports.getAllSubjects = async (req, res) => {

    try {

        const subjects = await Subject.find()
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
        });

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

        const subjects = await Subject.find({
            department: req.user.department,
            semester: req.user.semester
        });

        res.json(subjects);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};