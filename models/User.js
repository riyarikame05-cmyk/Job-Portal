import mongoose from "mongoose";


const userSchema = new mongoose.Schema({


    name: {

        type:String,

        required:true,

        trim:true

    },


    email: {

        type:String,

        required:true,

        unique:true,

        lowercase:true,

        trim:true

    },


    password: {

        type:String,

        required:true

    },


    role: {

        type:String,

        enum:[

            "Recruiter",

            "Job Seeker"

        ],

        required:true

    },


    appliedJobs:[

        {

            type:mongoose.Schema.Types.ObjectId,

            ref:"Job"

        }

    ],


    savedJobs:[

        {

            type:mongoose.Schema.Types.ObjectId,

            ref:"Job"

        }

    ]


},


{

    timestamps:true

});


export default mongoose.model(
    "User",
    userSchema
);