import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  company: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  salary: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  // Employee applications

  applicants: [

    {

      userId: {
        type: String
      },

      appliedAt: {

        type: Date,

        default: Date.now

      }

    }

  ],

  // Job status

  status: {

    type: String,

    default: "Active"

  },

  // Created date

  createdAt: {

    type: Date,

    default: Date.now

  }

});

export default mongoose.model("Job", jobSchema);