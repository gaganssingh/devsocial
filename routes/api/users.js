const express = require("express");
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const normalize = require("normalize-url");

const User = require("../../models/User");

const router = express.Router();

// @route   GET   /api/users
// @desc    Register User
// @access  Public
router.post(
   "/",
   [
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please inclue a valid email").isEmail(),
      check("password", "Please must be atleast 6 characters").isLength({
         min: 6,
      }),
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      try {
         // Check if user already exists in db
         let user = await User.findOne({ email });

         if (user) {
            return res
               .status(400)
               .json({ errors: [{ msg: "User already exists" }] });
         }

         // Get user's gravatar
         const avatar = normalize(
            gravatar.url(email, {
               s: "200",
               r: "pg",
               d: "mm",
            }),
            { forceHttps: true }
         );

         user = new User({
            name,
            email,
            avatar,
            password,
         });

         // Encrypt password
         const salt = await bcrypt.genSalt(10);
         user.password = await bcrypt.hash(password, salt);

         // Save user to DB
         await user.save();

         // Return jsonwebtoken
         res.send(user);
      } catch (err) {
         console.error(err.message);
         res.status(500).send(`Server error`);
      }

      res.json(user);
   }
);

module.exports = router;
