import express from "express";
import { connectToDB } from "./src/utils/db.mjs";
import { ExpressError } from "./src/utils/ExpressError.mjs";
import { AuthRoutes } from "./src/Routes/Auth.Routes.mjs";
import { UserRoutes } from "./src/Routes/User.Routes.mjs";
import { checkUser } from "./src/Middleware/Auth.Middleware.mjs";
import productRouter from "./src/Routes/product.route.mjs";
import orderRoutes from "./src/Routes/order.route.mjs";
import cors from "cors";
import { router as webhookRoutes } from "./src/Routes/webhook.route.mjs";

import dotenv from "dotenv";
dotenv.config();

import { router as cartRoutes } from "./src/Routes/Cart.mjs";
import { router as wishListRoutes } from "./src/Routes/wishList.route.mjs";
import { router as profileRoutes } from "./src/Routes/profile.route.mjs";
import { sendMail } from "./src/Controllers/contactUsEmail.Controller.mjs";
import helmet from "helmet";
connectToDB();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(helmet());

const whitelist = process.env.whitelist.split(" ");
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use("/webhooks", webhookRoutes);
app.use(cors(corsOptions));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(AuthRoutes);
app.use(checkUser);

app.use("/User", UserRoutes);
app.use("/products", productRouter);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/wishlist", wishListRoutes);
app.use("/profile", profileRoutes);
app.get("/contact-us-email", sendMail);

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
