const path = require("path");

app.use(express.static(path.join(__dirname, "Public")));
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Job = require("./models/Job");
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

dns.setDefaultResultOrder("ipv4first");
require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public folder serve karne ke liye
app.use(express.static(path.join(__dirname, "Public")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "register.html"));
});

//Register Route//
app.post("/register", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        console.log("Register Data:", req.body);

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
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
            message: "Registration Successful"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Registration Failed"
        });

    }

});

//Login Route//
app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("LOGIN DATA:", email, password);

        const user = await User.findOne({ email });

        console.log("USER FOUND:", user);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not found"
            });
        }


        const isMatch = await bcrypt.compare(password, user.password);


        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Wrong password"
            });

        }


        res.json({
            success: true,
            message: "Login Successful",
            user: user
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});

// GET ALL JOBS
app.get("/jobs", async(req,res)=>{

    try{

        const jobs = await Job.find();

        res.json(jobs);

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});




// GET SINGLE JOB  ⭐ EDIT PAGE KE LIYE

app.get("/jobs/:id", async(req,res)=>{

    try{

        const job = await Job.findById(req.params.id);


        if(!job){

            return res.status(404).json({
                message:"Job not found"
            });

        }


        res.json(job);


    }
    catch(error){

        console.log(error);

        res.status(500).json({
            message:error.message
        });

    }

});




// CREATE JOB

app.post("/jobs", async(req,res)=>{

    try{

        const job = new Job({

            title:req.body.title,
            company:req.body.company,
            location:req.body.location,
            salary:req.body.salary,
            description:req.body.description

        });


        const savedJob = await job.save();

        res.json(savedJob);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});





// UPDATE JOB ⭐

app.put("/jobs/:id", async(req,res)=>{

    try{


        const updatedJob = await Job.findByIdAndUpdate(

            req.params.id,

            {

                title:req.body.title,
                company:req.body.company,
                location:req.body.location,
                salary:req.body.salary,
                description:req.body.description

            },

            {
                new:true
            }

        );


        res.json(updatedJob);


    }
    catch(error){

        console.log(error);

        res.status(500).json({
            message:error.message
        });

    }


});





// DELETE JOB

app.delete("/jobs/:id", async(req,res)=>{

    try{

        await Job.findByIdAndDelete(req.params.id);

        res.json({
            message:"Job Deleted"
        });


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "login.html"));
});


// MongoDB Connection//

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {

    console.log("MongoDB Connected Successfully 🚀");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

})
.catch((err) => {

    console.log("MongoDB Connection Error ❌");
    console.log(err);

});