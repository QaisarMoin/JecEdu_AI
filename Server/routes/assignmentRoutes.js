const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// GET assignments (Faculty - all, Students - filtered by their class)
router.get(
    "/",
    verifyToken,
    assignmentController.getAssignments
);

// CREATE assignment (Faculty only)
router.post(
    "/",
    verifyToken,
    authorizeRoles("faculty", "admin"),
    assignmentController.createAssignment
);

// DELETE assignment (Faculty creator or Admin)
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("faculty", "admin"),
    assignmentController.deleteAssignment
);

module.exports = router;
