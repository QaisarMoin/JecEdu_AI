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

module.exports = router;