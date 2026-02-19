const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


// any logged in user
router.get("/profile", verifyToken, (req, res) => {

    res.json({
        message: "Profile accessed",
        user: req.user
    });

});


// admin only
router.get(
    "/admin",
    verifyToken,
    authorizeRoles("admin"),
    (req, res) => {

        res.json({
            message: "Welcome Admin"
        });

    }
);


// faculty only
router.get(
    "/faculty",
    verifyToken,
    authorizeRoles("faculty"),
    (req, res) => {

        res.json({
            message: "Welcome Faculty"
        });

    }
);

module.exports = router;
