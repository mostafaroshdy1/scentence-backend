import express from "express";
import { connectToDB } from "./src/utils/db.mjs";
import { ExpressError } from "./src/utils/ExpressError.mjs";
import productRouter from "./src/Routes/product.route.mjs";
import cors from "cors";

import dotenv from 'dotenv';
dotenv.config();


connectToDB();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// app.use('/users', routeName);
// app.use('/etc', routeName);
// app.use('/etc', routeName);

app.use("/products", productRouter);

//  Any Invalid routes
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong";
  return res.status(statusCode).json(err.message);
});

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});
