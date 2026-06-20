import mongoose from "mongoose";

mongoose.connect("mongodb+srv://riyarender:riyahr@cluster0.vjfno88.mongodb.net/jobportal")
  .then(() => console.log("CONNECTED"))
  .catch(err => console.log(err));