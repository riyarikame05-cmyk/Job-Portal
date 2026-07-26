import mongoose from "mongoose";


// ================= APPLICANT SCHEMA =================

const applicantSchema = new mongoose.Schema({

    userId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    status: {

        type: String,

        default: "Applied"

    },

    appliedAt: {

        type: Date,

        default: Date.now

    }

});


// ================= JOB SCHEMA =================

const jobSchema = new mongoose.Schema({

    title: {

        type: String,

        required: true,

        trim: true

    },


    company: {

        type: String,

        required: true,

        trim: true

    },


    location: {

        type: String,

        required: true,

        trim: true

    },


    salary: {

        type: String,

        required: true,

        trim: true

    },


    description: {

        type: String,

        required: true,

        trim: true

    },


    // Recruiter who created job

    recruiter: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },


    // People who applied

    applicants: {

        type: [applicantSchema],

        default: []

    },


    // Users who saved job

    savedBy: [

        {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        }

    ],


    status: {

        type: String,

        enum: [

            "Active",

            "Closed"

        ],

        default: "Active"

    }


},


{

    timestamps:true

});


export default mongoose.model(
    "Job",
    jobSchema
);