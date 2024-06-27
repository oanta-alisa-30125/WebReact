const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require('../models/userModel');



router.post("/register", async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Emailul există deja' });
        }

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: false 
        });

        await newUser.save();
        res.send('Înregistrare cu succes');
    } catch (error) {
        res.status(500).json({ message: 'Ceva n-a mers bine' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        if (user) {
            const userData = {
                name: user.name,
                _id: user._id,
                email: user.email,
                isAdmin: user.isAdmin
            };
            res.send(userData);
        } else {
            return res.status(400).json({ message: 'Credentiale invalide' });
        }
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
});

router.post("/update", async (req, res) => {
    try {
        const { userid, updateduser } = req.body;

        await User.findByIdAndUpdate(userid, {
            name: updateduser.name,
            email: updateduser.email,
            password: updateduser.password,
            isAdmin: updateduser.isAdmin 
        });

        res.send('User details updated successfully');
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
    }
});

router.get('/getallusers', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
    }
});

router.post('/deleteuser', async (req, res) => {
    try {
        if (!req.body.userid) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        await User.findByIdAndDelete(req.body.userid);
        res.send('Utilizator sters cu succes');
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
    }
});
router.post("/updateUserAsAdmin", async (req, res) => {
    try {
        const { userid, isAdmin } = req.body;
        await User.findByIdAndUpdate(userid, { isAdmin: isAdmin });
        res.send('User admin rights updated successfully');
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
    }
});


module.exports = router;
