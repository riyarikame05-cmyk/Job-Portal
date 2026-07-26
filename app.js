import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dns from "dns";

import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import Job from "./models/Job.js";


// ================= DNS FIX =================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


// ================= CONFIG =================

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;


// ================= PATH FIX =================

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


// ================= MIDDLEWARE =================

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

app.use(express.static(
    path.join(__dirname,"public")
));



// ================= JWT MIDDLEWARE =================


function verifyToken(req,res,next){

    try{

        const authHeader =
        req.headers.authorization;


        if(!authHeader){

            return res.status(401).json({

                success:false,

                message:"No token provided"

            });

        }


        const token =
        authHeader.split(" ")[1];


        if(!token){

            return res.status(401).json({

                success:false,

                message:"Invalid token"

            });

        }



        const decoded =
        jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;


        next();


    }

    catch(error){


        return res.status(403).json({

            success:false,

            message:"Token expired or invalid"

        });


    }

}



// ================= ROLE CHECK =================


function recruiterOnly(req,res,next){


    if(req.user.role !== "Recruiter"){


        return res.status(403).json({

            success:false,

            message:"Recruiter access only"

        });


    }


    next();


}



// ================= HOME =================


app.get("/",(req,res)=>{


    res.sendFile(
        path.join(
            __dirname,
            "public",
            "register.html"
        )
    );


});




// ================= REGISTER =================


app.post("/register",async(req,res)=>{


    try{


        const {

            name,

            email,

            password,

            role


        } = req.body;



        if(!name || !email || !password || !role){


            return res.json({

                success:false,

                message:"All fields required"

            });


        }



        const cleanEmail =
        email.toLowerCase().trim();



        const existing =
        await User.findOne({

            email:cleanEmail

        });



        if(existing){


            return res.json({

                success:false,

                message:"Email already registered"

            });


        }



        const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );



        const user =
        new User({


            name:name.trim(),


            email:cleanEmail,


            password:hashedPassword,


            role


        });



        await user.save();



        res.json({

            success:true,

            message:"Registration successful"

        });



    }

    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:"Server error"

        });


    }


});




// ================= LOGIN =================


app.post("/login",async(req,res)=>{


    try{


        const {

            email,

            password


        } = req.body;



        const user =
        await User.findOne({

            email:
            email.toLowerCase().trim()

        });



        if(!user){


            return res.json({

                success:false,

                message:"User not found"

            });


        }



        const match =
        await bcrypt.compare(

            password,

            user.password

        );



        if(!match){


            return res.json({

                success:false,

                message:"Wrong password"

            });


        }



        const token =
        jwt.sign(

            {

                id:user._id,

                role:user.role

            },


            process.env.JWT_SECRET,


            {

                expiresIn:"1d"

            }


        );



        res.json({


            success:true,


            message:"Login successful",


            token,


            user:{


                id:user._id,

                name:user.name,

                email:user.email,

                role:user.role


            }


        });



    }

    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:"Server error"

        });


    }


});


// ================= CREATE JOB =================


app.post(
    "/jobs",
    verifyToken,
    recruiterOnly,
    async(req,res)=>{


    try{


        const {

            title,

            company,

            location,

            salary,

            description


        } = req.body;



        const job =
        new Job({


            title,

            company,

            location,

            salary,

            description,


            recruiter:req.user.id


        });



        await job.save();



        res.json({


            success:true,


            message:"Job posted successfully",


            job


        });



    }

    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= GET ALL JOBS =================


app.get("/jobs",async(req,res)=>{


    try{


        const jobs =
        await Job.find()

        .populate(
            "recruiter",
            "name email"
        )

        .sort({

            createdAt:-1

        });



        res.json({


            success:true,


            jobs


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= GET SINGLE JOB =================


app.get("/jobs/:id",async(req,res)=>{


    try{


        const job =
        await Job.findById(
            req.params.id
        )

        .populate(
            "recruiter",
            "name email"
        );



        if(!job){


            return res.status(404).json({

                success:false,

                message:"Job not found"

            });


        }



        res.json({


            success:true,

            job


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= UPDATE JOB =================


app.put(
"/jobs/:id",
verifyToken,
recruiterOnly,
async(req,res)=>{


    try{


        const job =
        await Job.findById(
            req.params.id
        );



        if(!job){


            return res.status(404).json({

                success:false,

                message:"Job not found"

            });


        }



        // only owner can edit


        if(
            job.recruiter.toString()
            !==
            req.user.id
        ){


            return res.status(403).json({

                success:false,

                message:"You cannot edit this job"

            });


        }



        const updatedJob =
        await Job.findByIdAndUpdate(

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



        res.json({


            success:true,


            message:"Job updated successfully",


            job:updatedJob


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= DELETE JOB =================


app.delete(
"/jobs/:id",
verifyToken,
recruiterOnly,
async(req,res)=>{


    try{


        const job =
        await Job.findById(
            req.params.id
        );



        if(!job){


            return res.status(404).json({

                success:false,

                message:"Job not found"

            });


        }



        if(
            job.recruiter.toString()
            !==
            req.user.id
        ){


            return res.status(403).json({

                success:false,

                message:"You cannot delete this job"

            });


        }



        await job.deleteOne();



        res.json({

            success:true,

            message:"Job deleted successfully"

        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= APPLY JOB =================


app.post(
"/apply/:id",
verifyToken,
async(req,res)=>{


    try{


        const job =
        await Job.findById(
            req.params.id
        );



        if(!job){


            return res.json({

                success:false,

                message:"Job not found"

            });


        }



        const alreadyApplied =
        job.applicants.some(

            applicant =>

            applicant.userId.toString()
            ===
            req.user.id

        );



        if(alreadyApplied){


            return res.json({

                success:false,

                message:"Already applied"

            });


        }



        job.applicants.push({


            userId:req.user.id,


            status:"Applied"


        });



        await job.save();




        await User.findByIdAndUpdate(

            req.user.id,


            {


                $addToSet:{


                    appliedJobs:job._id


                }


            }


        );



        res.json({


            success:true,


            message:"Application submitted"


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= SAVE JOB =================


app.post(
"/save/:id",
verifyToken,
async(req,res)=>{


    try{


        const job =
        await Job.findById(
            req.params.id
        );



        if(!job){


            return res.json({

                success:false,

                message:"Job not found"

            });


        }



        if(
            job.savedBy.includes(
                req.user.id
            )
        ){


            return res.json({

                success:false,

                message:"Already saved"

            });


        }



        job.savedBy.push(
            req.user.id
        );


        await job.save();



        await User.findByIdAndUpdate(

            req.user.id,


            {

                $addToSet:{


                    savedJobs:job._id


                }

            }

        );



        res.json({


            success:true,


            message:"Job saved"

        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});


// ================= REMOVE SAVED JOB =================


app.delete(
"/save/:id",
verifyToken,
async(req,res)=>{


    try{


        const job =
        await Job.findById(
            req.params.id
        );



        if(!job){


            return res.status(404).json({

                success:false,

                message:"Job not found"

            });


        }



        job.savedBy =
        job.savedBy.filter(

            id =>
            id.toString()
            !==
            req.user.id

        );



        await job.save();



        await User.findByIdAndUpdate(

            req.user.id,


            {

                $pull:{


                    savedJobs:req.params.id


                }

            }


        );



        res.json({


            success:true,


            message:"Removed from saved jobs"


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= MY APPLICATIONS =================


app.get(
"/my-applications",
verifyToken,
async(req,res)=>{


    try{


        const jobs =
        await Job.find({

            "applicants.userId":
            req.user.id

        })

        .sort({

            createdAt:-1

        });



        res.json({


            success:true,


            jobs


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= SAVED JOBS =================


app.get(
"/saved-jobs",
verifyToken,
async(req,res)=>{


    try{


        const user =
        await User.findById(
            req.user.id
        )
        .populate("savedJobs");



        res.json({


            success:true,


            jobs:user.savedJobs


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= RECRUITER JOBS =================


app.get(
"/my-jobs",
verifyToken,
recruiterOnly,
async(req,res)=>{


    try{


        const jobs =
        await Job.find({

            recruiter:req.user.id

        })

        .sort({

            createdAt:-1

        });



        res.json({


            success:true,


            jobs


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= RECRUITER ANALYTICS =================


app.get(
"/analytics",
verifyToken,
recruiterOnly,
async(req,res)=>{


    try{


        const jobs =
        await Job.find({

            recruiter:req.user.id

        });



        let totalApplicants = 0;



        jobs.forEach(job=>{


            totalApplicants +=
            job.applicants.length;


        });



        res.json({


            success:true,


            totalJobs:jobs.length,


            totalApplicants,


            activeJobs:

            jobs.filter(

                job =>
                job.status==="Active"

            ).length


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= SEARCH JOBS =================


app.get(
"/search",
async(req,res)=>{


    try{


        const keyword =
        req.query.keyword || "";



        const jobs =
        await Job.find({

            $or:[


                {

                    title:{

                        $regex:keyword,

                        $options:"i"

                    }

                },


                {

                    company:{

                        $regex:keyword,

                        $options:"i"

                    }

                },


                {

                    location:{

                        $regex:keyword,

                        $options:"i"

                    }

                }


            ]

        });



        res.json({


            success:true,


            jobs


        });



    }

    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// ================= DASHBOARD PAGE =================


app.get(
"/dashboard",
(req,res)=>{


    res.sendFile(

        path.join(

            __dirname,

            "public",

            "dashboard.html"

        )

    );


});





// ================= DATABASE CONNECTION =================


async function connectDB(){


    try{


        console.log(
            "Connecting MongoDB..."
        );



        await mongoose.connect(

            process.env.MONGO_URI,

            {

                serverSelectionTimeoutMS:30000

            }

        );



        console.log(
            "MongoDB Connected ✅"
        );


    }

    catch(error){


        console.log(
            "MongoDB Error ❌"
        );


        console.log(error);


        process.exit(1);


    }


}





// ================= START SERVER =================


async function startServer(){


    await connectDB();



    app.listen(

        PORT,


        ()=>{


            console.log(
                `🚀 Server running on port ${PORT}`
            );


        }


    );


}



startServer();