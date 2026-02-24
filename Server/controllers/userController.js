const User = require("../models/User");
const bcrypt = require("bcryptjs");


// ADMIN CREATE USER (student or faculty)
exports.createUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            rollNo,
            department,
            semester
        } = req.body;

        // check existing email
        const existing = await User.findOne({ email });

        if (existing) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }

        // hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({

            name,
            email,
            password: hashedPassword,
            role,
            rollNo,
            department,
            semester

        });

        res.json({
            message: "User created successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// GET ALL USERS
exports.getUsers = async (req, res) => {

    try {

        const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// DELETE USER
exports.deleteUser = async (req, res) => {

    try {

        await User.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "User deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};