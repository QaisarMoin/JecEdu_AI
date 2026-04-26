const Assignment = require("../models/Assignment");
const User = require("../models/User");

// CREATE ASSIGNMENT (Faculty Only)
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, department, semester, subject, startDate, endDate } = req.body;

        const assignment = await Assignment.create({
            title,
            description,
            faculty: req.user.id,
            department,
            semester,
            subject,
            startDate,
            endDate
        });

        res.json({
            message: "Assignment created successfully",
            assignment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ASSIGNMENTS
// Students: Filter by their department & semester
// Faculty: View all they created
exports.getAssignments = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "student") {
            const { department, semester } = req.user;
            filter = { department, semester };
        } else if (req.user.role === "faculty") {
            // Option 1: Show only their own assignments
            // Option 2: Show all (to let students see all subject assignments)
            // User requested: "all the students can see the all subject assignment"
            // So for students we filter by class, for faculty they might want to see all or just theirs.
            // Let's filter by faculty id if they want to manage theirs, or just return all for the student view.
            
            // If it's a student requesting, we filter. If faculty wants to manage, we might filter by faculty.
        }

        // To fulfill "all students can see all subject assignments", 
        // we use the student's department and semester context.
        
        if (req.user.role === "student") {
            // Student's info is usually not in the token, fetch from DB
            const user = await User.findById(req.user.id);
            if (user) {
                filter = { department: user.department, semester: Number(user.semester) };
            }
        }

        const assignments = await Assignment.find(filter)
            .populate("faculty", "name email")
            .populate("subject", "name code")
            .sort({ createdAt: -1 });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE ASSIGNMENT
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Only allow the creator or admin to delete
        if (assignment.faculty.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: "Assignment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
