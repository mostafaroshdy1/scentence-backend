import express from "express";
import { connectToDB } from "./src/utils/db.mjs";
import { ExpressError } from "./src/utils/ExpressError.mjs";

import productRouter from "./src/Routes/product.route.mjs";
import cors from "cors";

// import dotenv from 'dotenv';
// dotenv.config();


import { router as cartRoutes } from "./src/Routes/Cart.mjs";

import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";


connectToDB();
const PORT = process.env.PORT || 3000;
const app = express();
const redisClient = createClient();
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(
  session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: process.env.SESSION_SECRET,
  })
);
// app.use('/users', routeName);
// app.use('/etc', routeName);
// app.use('/etc', routeName);


app.use("/products", productRouter);
app.use("/cart", cartRoutes);


//  Any Invalid routes
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong";
  return res.status(statusCode).json(err.message);
});

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});
