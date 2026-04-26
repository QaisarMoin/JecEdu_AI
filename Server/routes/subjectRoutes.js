const express = require("express");
const router = express.Router();

const subjectController = require("../controllers/subjectController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// create subject (admin only)
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    subjectController.createSubject
);


// get all subjects (admin) — supports ?department=IT&semester=3
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    subjectController.getAllSubjects
);


// faculty subjects
router.get(
    "/faculty",
    verifyToken,
    authorizeRoles("faculty"),
    subjectController.getFacultySubjects
);


// student subjects
router.get(
    "/student",
    verifyToken,
    authorizeRoles("student"),
    subjectController.getStudentSubjects
);


// update subject (admin only)
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    subjectController.updateSubject
);

// delete subject (admin only)
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    subjectController.deleteSubject
);


module.exports = router;