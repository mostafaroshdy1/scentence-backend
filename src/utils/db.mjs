import mongoose from "mongoose";

export { connectToDB };

const dbUrl = process.env.DB_URL;
async function connectToDB() {
  await mongoose.connect(dbUrl);
  console.log(`Connected to Database`);
}
