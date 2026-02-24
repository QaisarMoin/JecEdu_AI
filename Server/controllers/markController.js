const Mark = require("../models/Mark");
const Subject = require("../models/Subject");
const User = require("../models/User");


// FACULTY ENTER MARKS
exports.enterMarks = async (req, res) => {

    try {

        const { subjectId, marks } = req.body;

        for (let m of marks) {

            const mstBest =
                Math.max(m.mst1Marks, m.mst2Marks);

            const total =
                mstBest +
                m.assignmentMarks +
                m.practicalMarks;

            await Mark.findOneAndUpdate(

                {
                    student: m.studentId,
                    subject: subjectId
                },

                {
                    student: m.studentId,
                    subject: subjectId,
                    mst1Marks: m.mst1Marks,
                    mst2Marks: m.mst2Marks,
                    assignmentMarks: m.assignmentMarks,
                    practicalMarks: m.practicalMarks,
                    mstBest,
                    totalMarks: total
                },

                {
                    upsert: true,
                    returnDocument: "after"
                }

            );

        }

        res.json({
            message: "Marks saved successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// STUDENT VIEW MARKS
exports.getStudentMarks = async (req, res) => {

    try {

        const studentId = req.user.id;

        const marks = await Mark.find({
            student: studentId
        })
        .populate("subject", "name code");

        res.json(marks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// FACULTY VIEW MARKS BY SUBJECT
exports.getSubjectMarks = async (req, res) => {

    try {

        const subjectId = req.params.subjectId;

        const marks = await Mark.find({
            subject: subjectId
        })
        .populate("student", "name rollNo");

        res.json(marks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};