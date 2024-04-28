import mongoose from "mongoose";

export { connectToDB };

const dbName = `perfume-shop`;

const dbUrl = process.env.DB_URL || `mongodb://127.0.0.1:27017/${dbName}`;
async function connectToDB() {
  await mongoose.connect(dbUrl);
  console.log(`Connected to Database: ${dbName}`);
}
