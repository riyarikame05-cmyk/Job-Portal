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

module.exports = { sql, config };