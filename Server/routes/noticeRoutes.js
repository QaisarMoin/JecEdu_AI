const express = require("express");
const router = express.Router();

const noticeController = require("../controllers/noticeController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


// create notice (admin, faculty)
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin", "faculty"),
    noticeController.createNotice
);


// get notices (everyone logged in)
router.get(
    "/",
    verifyToken,
    noticeController.getNotices
);


// delete notice (admin only)
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    noticeController.deleteNotice
);


module.exports = router;