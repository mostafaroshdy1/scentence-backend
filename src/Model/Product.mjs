import { de } from "@faker-js/faker";
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: [{ type: String, required: true }],
    date: {
      type: Date,
      default: Date.now,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      1: {
        type: Number,
        default: 0,
      },
      2: {
        type: Number,
        default: 0,
      },
      3: {
        type: Number,
        default: 0,
      },
      4: {
        type: Number,
        default: 0,
      },
      5: {
        type: Number,
        default: 0,
      },
    },
    totalRating: {
      user: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      rating: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  },
  {}
);

export default model("Product", productSchema);
