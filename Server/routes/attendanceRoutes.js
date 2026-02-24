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

// class attendence
router.post(
    "/mark-class",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.markClassAttendance
);

router.get(
    "/status",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.checkAttendanceStatus
);

// get subject attendence
router.get(
    "/subject/:subjectId",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.getSubjectAttendance
);

// attendance history
router.get(
    "/history/:subjectId",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.getAttendanceHistory
);

// update attendance
router.put(
    "/update",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.updateAttendance
);

router.get(
    "/analytics/:subjectId",
    verifyToken,
    authorizeRoles("faculty"),
    attendanceController.getSubjectAnalytics
);

router.get(
    "/student-summary",
    verifyToken,
    authorizeRoles("student"),
    attendanceController.getStudentAttendanceSummary
);


module.exports = router;