const Notice = require("../models/Notice");


// CREATE NOTICE
exports.createNotice = async (req, res) => {

    try {

        const { title, description, priority, expiryDate } = req.body;

        const notice = await Notice.create({
            title,
            description,
            priority,
            expiryDate,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Notice created successfully",
            notice
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET ALL NOTICES
exports.getNotices = async (req, res) => {

    try {

        const notices = await Notice.find()
        .populate("createdBy", "name role")
        .sort({ createdAt: -1 });

        res.json(notices);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// DELETE NOTICE
exports.deleteNotice = async (req, res) => {

    try {

        await Notice.findByIdAndDelete(req.params.id);

        res.json({
            message: "Notice deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};