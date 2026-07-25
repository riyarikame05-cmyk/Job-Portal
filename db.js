const sql = require("mssql");

const config = {
    user: "RIYA5",
    password: "Riya@123",
    server: "127.0.0.1",
    port: 1433,
    database: "JobPortalDB",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = { sql, config };const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected ✅");
    } catch (error) {
        console.log("MongoDB Error ❌", error);
        process.exit(1);
    }
};
module.exports = connectDB;