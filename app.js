import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import Job from "./models/Job.js";
dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 3000;

// __dirname fix (ES module)//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

// ⭐ ROOT ROUTE (OPEN REGISTER FIRST)
app.get("/", (req, res) => {
  res.redirect("/register.html");
});


// serve frontend//
app.use(express.static(path.join(__dirname, "public")));

// 🔥 REGISTER API//
app.post("/register", async (req, res) => {
  
  try {
    console.log("Register request received");
console.log(req.body);

    const { name, email, password, role } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role
    });

    await newUser.save();

    console.log("USER SAVED:", newUser);

    res.json({
      success: true,
      message: "Registration successful"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
// 🔥 LOGIN API //
app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;
    console.log("Email entered:", email);
console.log("Password entered:", password);

    const cleanEmail = email.trim().toLowerCase();

    console.log("LOGIN BODY:", req.body);

    const user = await User.findOne({
      email: cleanEmail
    });

    console.log("USER FOUND:", user);

    if (!user) {

      return res.json({
        success: false,
        message: "User not found"
      });

    }

    const isMatch = await bcrypt.compare(
      password.trim(),
      user.password
    );

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {

      return res.json({
        success: false,
        message: "Invalid password"
      });

    }

    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d"
      }

    );

    res.json({

      success: true,

      message: "Login successful",

      token,

      user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role

      }

    });

  }

  catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

});

//job post//
app.post("/jobs", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can post jobs"
      });
    }

    const job = new Job({

  ...req.body,

  createdAt: new Date()

});
    await job.save();

    console.log("JOB SAVED:", job);

    res.json({
      success: true,
      message: "Job created successfully",
      job
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// GET ALL JOBS //

app.get("/jobs", async (req, res) => {

  try {

    const jobs = await Job.find().sort({
      _id: -1
    });

    res.json(jobs);

  }

  catch (err) {

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});


// DELETE JOB (RECRUITER ONLY)//
app.delete("/jobs/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "Recruiter") {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Job deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ➤ UPDATE JOB (RECRUITER ONLY) //

// ➤ UPDATE JOB (RECRUITER ONLY) //

app.put("/jobs/:id", verifyToken, async (req, res) => {

  try {

    if (req.user.role !== "Recruiter") {

      return res.status(403).json({

        success: false,

        message: "Only recruiters can update jobs"

      });

    }

    const updatedJob = await Job.findByIdAndUpdate(

      req.params.id,

      req.body,

      { new: true }

    );

    if (!updatedJob) {

      return res.status(404).json({

        success: false,

        message: "Job not found"

      });

    }

    res.json({

      success: true,

      message: "Job updated successfully",

      job: updatedJob

    });

  }

  catch (err) {

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

});
// 🔥 DASHBOARD ROUTE (optional backend page serve) //
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});


// 🔥 MONGODB CONNECTION //
mongoose.connect(process.env.MONGO_URI, {
  dbName: "jobportal"
})
.then(() => {
  console.log("MongoDB Connected 🚀");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

})
.catch((err) => {
  console.log("MongoDB Error ❌", err);
});