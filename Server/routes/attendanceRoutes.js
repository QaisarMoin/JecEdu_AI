const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


// mark attendance (faculty only)
router.post(
    "/",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.markAttendance
);


// student view attendance
router.get(
    "/student",
    verifyToken,
    authorizeRoles("student"),
    attendanceController.getStudentAttendance
);


// attendance percentage
router.get(
    "/percentage/:subjectId",
    verifyToken,
    authorizeRoles("student"),
    attendanceController.getAttendancePercentage
);


module.exports = router;