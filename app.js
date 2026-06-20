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

// serve frontend//
app.use(express.static(path.join(__dirname, "public")));

// 🔥 REGISTER API//
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

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

// 🔥 LOGIN API//
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password"
      });
    }

    // ✅ SUCCESS LOGIN RESPONSE (YOU MISSED THIS)
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


    // 🔥 CREATE JWT TOKEN
    app.post("/jobs", verifyToken, async (req, res) => {
  try {

    if (req.user.role !== "Recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can post jobs"
      });
    }

    const { title, company, location, salary, description } = req.body;

    const job = new Job({
      title,
      company,
      location,
      salary,
      description
    });

    await job.save();

    res.json({
      success: true,
      message: "Job created successfully",
      job
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Jobs//
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ _id: -1 });

    res.json(jobs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Delete Job//
app.delete("/jobs/:id", verifyToken, async (req, res) => {

  try {

    if (req.user.role !== "Recruiter") {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Job deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➤ UPDATE JOB//
app.put("/jobs/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➤ DELETE JOB//
app.delete("/jobs/:id", async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// 🔥 DASHBOARD ROUTE (optional backend page serve) //
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// 🔥 DEFAULT ROUTE //
app.get("/", (req, res) => {
  res.redirect("/register.html");
});


// 🔥 MONGODB CONNECTION //
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected 🚀");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Error ❌", err.message);
  });