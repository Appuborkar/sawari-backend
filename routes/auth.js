const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const process = require('process');
const dotenv = require('dotenv');
const authMiddleware = require("../middleware/authMiddleware");
dotenv.config();

const JWT_SECRET = "Sawari Booking platform";

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Profile/'); // Folder where images will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid name conflicts
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

// Signup Route
router.post(
    '/signup',
    upload.single('photo'), // Middleware for single file upload
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email').isEmail(),
        body('mobile', 'Enter a valid mobile number').isLength({ min: 10 }),
        body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ msg: 'User with this email already exists' });
            }

          
            const salt = await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(req.body.password, salt);

            const photoPath = req.file ? req.file.path : null; // Save file path

            user = await User.create({
                photo: photoPath,
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: secPassword,
            });

            const data = {
                user: {
                    id: user.id,
                    name: user.name,
                },
            };
            success = true;

            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({ success, authToken, userId:user.id });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error Occurred');
        }
    }
);

// login route
router.post(
    "/login",
    [
      body("email", "Enter a valid email").isEmail(),
      body("password", "Password cannot be blank").exists(),
    ],
    
    async (req, res) => {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, error: "Empty request body received. Ensure JSON is sent properly." });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }
  
      try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
          return res.status(400).json({ success: false, error: "Invalid email or password." });
        }
  
        const passwordCompare = await bcrypt.compare(req.body.password, user.password);
        if (!passwordCompare) {
          return res.status(400).json({ success: false, error: "Invalid email or password." });
        }
  
        const data = { user: { id: user.id, name: user.name } };
        
        const authToken = jwt.sign(data, JWT_SECRET);
        
        res.json({ success: true, authToken, userId: user.id });
        
      } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
      }
    }
  );
  
//Fetch the user for sign in
router.get("/user", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password"); // Exclude password
      if (!user) return res.status(404).json({ error: "User not found" });

      // Append base URL for profile images
      const baseUrl = "http://localhost:5000";
      const userProfile = {
        ...user._doc, 
        photo: user.photo ? `${baseUrl}${user.photo}` : null
      };
      res.json({ success: true, user: userProfile });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Server error" });
    }
});

  // Fetch User Profile Route
  router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
  
        const baseUrl = "http://localhost:5000/"; // Ensure this matches your server URL
        res.json({
            ...user._doc, 
            photo: user.photo ? `${baseUrl}${user.photo}` : null, // Full URL for image
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
  });
  
// Update Profile Route
router.put("/update-profile", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
      const { name, email, mobile } = req.body;
      const updatedData = { name, email, mobile};

      if (req.file) {
        console.log("Uploaded file:", req.file);
        const filePath = `Profile/${req.file.filename}`.replace(/\\/g, "/"); 
          updatedData.photo = filePath; 
      }

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true }).select("-password");

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      const baseUrl = "http://localhost:5000/";
      res.json({
          ...updatedUser._doc,
          photo: updatedUser.photo ? `${baseUrl}${updatedUser.photo}` : null, 
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;