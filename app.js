const express = require("express");
const { sql, config } = require("./db");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});

app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        await sql.connect(config);

        await sql.query`
            INSERT INTO Users (name,email,password,role)
            VALUES (${name},${email},${password},${role})
        `;

        res.json({
            success: true,
            message: "Registration Successful"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`
            SELECT * FROM Users
            WHERE email=${email}
            AND password=${password}
        `;

        if (result.recordset.length > 0) {
            res.json({
                success: true,
                user: result.recordset[0]
            });
        } else {
            res.json({
                success: false,
                message: "Invalid Credentials"
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server Running On http://localhost:3000");
});