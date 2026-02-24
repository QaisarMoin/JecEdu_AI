const express = require("express");
const router = express.Router();
const User = require("../models/User");

const userController =
require("../controllers/userController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// GET students by department and semester
router.get(
    "/students",
    verifyToken,
    authorizeRoles("admin", "faculty"),
    async (req, res) => {

        try {

            const { department, semester } = req.query;

            const students = await User.find({

                role: "student",
                department,
                semester: Number(semester)

            }).select("_id name rollNo email");

            res.json(students);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }
);

// admin only
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    userController.createUser
);


router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    userController.getUsers
);


router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    userController.deleteUser
);


module.exports = router;