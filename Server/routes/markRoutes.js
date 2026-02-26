const express = require("express");
const router = express.Router();

const markController = require("../controllers/markController");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// Faculty routes
router.post(
    "/enter",
    verifyToken,
    authorizeRoles("faculty"),
    markController.enterMarks
);

router.post(
    "/lock",
    verifyToken,
    authorizeRoles("faculty"),
    markController.lockComponent
);

router.post(
    "/unlock",
    verifyToken,
    authorizeRoles("faculty"),
    markController.unlockComponent
);

router.post(
    "/publish",
    verifyToken,
    authorizeRoles("faculty"),
    markController.publishComponent
);

router.post(
    "/unpublish",
    verifyToken,
    authorizeRoles("faculty"),
    markController.unpublishComponent
);

router.post(
    "/remarks",
    verifyToken,
    authorizeRoles("faculty"),
    markController.addRemarks
);

router.get(
    "/subject/:subjectId",
    verifyToken,
    authorizeRoles("faculty"),
    markController.getSubjectMarks
);

router.get(
    "/subject/:subjectId/stats",
    verifyToken,
    authorizeRoles("faculty"),
    markController.getSubjectStats
);


// Student routes
router.get(
    "/student",
    verifyToken,
    authorizeRoles("student"),
    markController.getStudentMarks
);


module.exports = router;