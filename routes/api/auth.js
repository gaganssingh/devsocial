const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route   GET   /api/auth
// @desc    Test route
// @access  Public
router.get("/", auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select("-password");
      console.log(user);
      res.json(user);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// @route   POST   /api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
   "/",
   [
      check("email", "Please inclue a valid email").isEmail(),
      check("password", "Please is required").exists(),
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
         // Check if user already exists in db
         let user = await User.findOne({ email });

         if (!user) {
            return res
               .status(400)
               .json({ errors: [{ msg: "Invalid Credentials" }] });
         }

         // Compare entered password with stored password
         const isMatch = await bcrypt.compare(password, user.password);

         // if passwords don't match
         if (!isMatch) {
            return res
               .status(400)
               .json({ errors: [{ msg: "Invalid Credentials" }] });
         }

         // If passwords match (password is correct):
         // Return jsonwebtoken
         const payload = {
            user: {
               id: user.id, // mongoose automatically converts _id to id
            },
         };

         jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
               if (err) throw err;
               res.json({ token });
            }
         );
      } catch (err) {
         console.error(err.message);
         res.status(500).send(`Server error`);
      }
   }
);

module.exports = router;
