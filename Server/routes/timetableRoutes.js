const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const tc = require("../controllers/timetableController");

// Admin routes
router.post(
  "/generate",
  verifyToken,
  authorizeRoles("admin"),
  tc.generate
);

router.get(
  "/weeks",
  verifyToken,
  authorizeRoles("admin"),
  tc.getWeeksList
);

router.get(
  "/week/:weekId",
  verifyToken,
  tc.getWeekEntries
);

router.post(
  "/finalize/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  tc.finalizeWeek
);

router.post(
  "/unfinalize/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  tc.unfinalizeWeek
);

router.put(
  "/entry/:entryId",
  verifyToken,
  authorizeRoles("admin"),
  tc.updateEntry
);

router.delete(
  "/entry/:entryId",
  verifyToken,
  authorizeRoles("admin"),
  tc.deleteEntry
);

router.post(
  "/entry",
  verifyToken,
  authorizeRoles("admin"),
  tc.addEntry
);

router.post(
  "/clone/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  tc.cloneWeek
);

router.delete(
  "/week/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  tc.deleteWeek
);

router.get(
  "/conflicts/:weekId",
  verifyToken,
  authorizeRoles("admin"),
  tc.checkConflicts
);

// Faculty route
router.get(
  "/faculty/:facultyId",
  verifyToken,
  authorizeRoles("admin", "faculty"),
  tc.getFacultyTimetable
);

// Student route
router.get(
  "/student",
  verifyToken,
  tc.getStudentTimetable
);

module.exports = router;