const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://riyarikame05_db_user:Riya12345@cluster0.vjfno88.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting...");

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect();

    console.log("CONNECTED SUCCESSFULLY 🚀");

    await client.close();
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}

run();