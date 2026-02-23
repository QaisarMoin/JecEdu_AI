const express = require("express");
const router = express.Router();

const User = require("../models/User");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


// GET all faculty (admin only)
router.get(
    "/faculty",
    verifyToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const faculty = await User.find({
                role: "faculty"
            }).select("_id name email");

            res.json(faculty);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);

// GET students by department and semester
router.get(
    "/students",
    verifyToken,
    authorizeRoles("faculty", "admin"),
    async (req, res) => {

        try {

            const { department, semester } = req.query;

            const students = await User.find({
                role: "student",
                department,
                semester
            }).select("_id name email rollNo");

            res.json(students);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);

module.exports = router;