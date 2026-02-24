const express = require("express");
const router = express.Router();

const markController = require("../controllers/markController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


router.post(
    "/",
    verifyToken,
    authorizeRoles("faculty"),
    markController.enterMarks
);


router.get(
    "/student",
    verifyToken,
    authorizeRoles("student"),
    markController.getStudentMarks
);


router.get(
    "/subject/:subjectId",
    verifyToken,
    authorizeRoles("faculty"),
    markController.getSubjectMarks
);


module.exports = router;