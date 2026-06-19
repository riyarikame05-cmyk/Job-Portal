const path = require('path');
const dotenv = require('dotenv');

// FORCE LOAD .env
const result = dotenv.config({ path: path.join(__dirname, '.env') });

console.log("ENV LOAD ERROR (if any):", result.error);
console.log("ENV CHECK:", process.env.MONGO_URI);