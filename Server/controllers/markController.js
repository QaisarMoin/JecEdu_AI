const Mark = require("../models/Mark");
const Subject = require("../models/Subject");
const User = require("../models/User");


// FACULTY: Enter marks for a specific component
exports.enterMarks = async (req, res) => {
    try {
        const { subjectId, component, marks } = req.body;

        const validComponents = [
            "mst1Marks", "mst2Marks",
            "assignmentMarks", "practicalMarks"
        ];

        if (!validComponents.includes(component)) {
            return res.status(400).json({
                message:
                    "Invalid component. Must be one of: "
                    + validComponents.join(", ")
            });
        }

        const lockField =
            component.replace("Marks", "Locked");

        // Check if component is locked for this subject
        const existingLocked = await Mark.findOne({
            subject: subjectId,
            [lockField]: true
        });

        if (existingLocked) {
            return res.status(400).json({
                message:
                    `${component.replace("Marks", "").toUpperCase()} marks are locked and cannot be modified`
            });
        }

        let savedCount = 0;

        for (let m of marks) {

            // Upsert the specific component field
            await Mark.findOneAndUpdate(
                {
                    student: m.studentId,
                    subject: subjectId
                },
                {
                    $set: {
                        [component]: m.value,
                        student: m.studentId,
                        subject: subjectId
                    }
                },
                {
                    upsert: true,
                    returnDocument: "after"
                }
            );

            // Recalculate mstBest and totalMarks
            await Mark.calculateAndUpdate(
                m.studentId,
                subjectId
            );

            savedCount++;
        }

        res.json({
            message:
                `${component.replace("Marks", "").toUpperCase()} marks saved successfully`,
            count: savedCount
        });

    } catch (error) {
        console.error("Enter marks error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: Lock a component
exports.lockComponent = async (req, res) => {
    try {
        const { subjectId, component } = req.body;

        const componentMap = {
            mst1: "mst1Locked",
            mst2: "mst2Locked",
            assignment: "assignmentLocked",
            practical: "practicalLocked"
        };

        const lockField = componentMap[component];

        if (!lockField) {
            return res.status(400).json({
                message: "Invalid component"
            });
        }

        await Mark.updateMany(
            { subject: subjectId },
            { $set: { [lockField]: true } }
        );

        res.json({
            message:
                `${component.toUpperCase()} marks locked successfully`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: Unlock a component
exports.unlockComponent = async (req, res) => {
    try {
        const { subjectId, component } = req.body;

        const componentMap = {
            mst1: "mst1Locked",
            mst2: "mst2Locked",
            assignment: "assignmentLocked",
            practical: "practicalLocked"
        };

        const lockField = componentMap[component];

        if (!lockField) {
            return res.status(400).json({
                message: "Invalid component"
            });
        }

        await Mark.updateMany(
            { subject: subjectId },
            { $set: { [lockField]: false } }
        );

        res.json({
            message:
                `${component.toUpperCase()} marks unlocked`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: Publish marks component to students
exports.publishComponent = async (req, res) => {
    try {
        const { subjectId, component } = req.body;

        const validComponents = [
            "mst1", "mst2", "assignment", "practical"
        ];

        if (!validComponents.includes(component)) {
            return res.status(400).json({
                message: "Invalid component"
            });
        }

        await Mark.updateMany(
            { subject: subjectId },
            {
                $addToSet: {
                    publishedComponents: component
                }
            }
        );

        res.json({
            message:
                `${component.toUpperCase()} marks published to students`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: Unpublish marks component
exports.unpublishComponent = async (req, res) => {
    try {
        const { subjectId, component } = req.body;

        await Mark.updateMany(
            { subject: subjectId },
            {
                $pull: {
                    publishedComponents: component
                }
            }
        );

        res.json({
            message:
                `${component.toUpperCase()} marks unpublished`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// STUDENT: View own marks (only published)
exports.getStudentMarks = async (req, res) => {
    try {
        const studentId = req.user.id;

        const marks = await Mark.find({
            student: studentId
        }).populate("subject", "name code department semester");

        // Filter to only show published components
        const filteredMarks = marks.map(mark => {
            const obj = mark.toObject();
            const published =
                obj.publishedComponents || [];

            return {
                _id: obj._id,
                subject: obj.subject,
                mst1Marks: published.includes("mst1")
                    ? obj.mst1Marks : undefined,
                mst2Marks: published.includes("mst2")
                    ? obj.mst2Marks : undefined,
                assignmentMarks:
                    published.includes("assignment")
                        ? obj.assignmentMarks : undefined,
                practicalMarks:
                    published.includes("practical")
                        ? obj.practicalMarks : undefined,
                mstBest:
                    (published.includes("mst1") ||
                        published.includes("mst2"))
                        ? obj.mstBest : undefined,
                totalMarks: obj.totalMarks,
                publishedComponents: published,
                remarks: obj.remarks,
                updatedAt: obj.updatedAt
            };
        });

        // Only return entries with at least
        // one published component
        const visibleMarks = filteredMarks.filter(
            m => m.publishedComponents.length > 0
        );

        res.json(visibleMarks);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: View marks by subject (full view)
exports.getSubjectMarks = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;

        const marks = await Mark.find({
            subject: subjectId
        }).populate("student", "name rollNo email");

        // Get lock/publish status
        let lockStatus = {
            mst1Locked: false,
            mst2Locked: false,
            assignmentLocked: false,
            practicalLocked: false,
            publishedComponents: []
        };

        if (marks.length > 0) {
            lockStatus = {
                mst1Locked: marks[0].mst1Locked,
                mst2Locked: marks[0].mst2Locked,
                assignmentLocked:
                    marks[0].assignmentLocked,
                practicalLocked:
                    marks[0].practicalLocked,
                publishedComponents:
                    marks[0].publishedComponents
            };
        }

        res.json({ marks, lockStatus });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: Get subject-level stats
exports.getSubjectStats = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;

        const marks = await Mark.find({
            subject: subjectId
        });

        if (marks.length === 0) {
            return res.json({
                totalStudents: 0,
                stats: {}
            });
        }

        const computeStats = (field) => {
            const values = marks
                .map(m => m[field])
                .filter(
                    v => v !== null &&
                        v !== undefined
                );

            if (values.length === 0) return null;

            const sum = values.reduce(
                (a, b) => a + b, 0
            );

            return {
                count: values.length,
                avg: (sum / values.length).toFixed(1),
                max: Math.max(...values),
                min: Math.min(...values)
            };
        };

        res.json({
            totalStudents: marks.length,
            stats: {
                mst1: computeStats("mst1Marks"),
                mst2: computeStats("mst2Marks"),
                assignment:
                    computeStats("assignmentMarks"),
                practical:
                    computeStats("practicalMarks"),
                total: computeStats("totalMarks")
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// FACULTY: Add remarks for a student
exports.addRemarks = async (req, res) => {
    try {
        const { subjectId, studentId, remarks } =
            req.body;

        await Mark.findOneAndUpdate(
            {
                student: studentId,
                subject: subjectId
            },
            { $set: { remarks } },
            {
                upsert: true,
                returnDocument: "after"
            }
        );

        res.json({
            message: "Remarks updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};