import mongoose from "mongoose";

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    orderId: {
      type: Number,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: Map,
      of: {
        type: Object,
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    },
    total: {
      type: Number,
      required: true,
    },
    secondPhone: {
      type: String,
      required: false,
    },

    city: {
      type: String,
      required: true,
    },
    Area: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    building: {
      type: Number,
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    apartment: {
      type: Number,
      required: true,
    },
    extra: {
      type: String,
      required: false,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "credit"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "on way",
        "delivered",
      ],
      required: true,
      default: "pending",
    },
    paymentId: {
      type: String,
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Order", orderSchema);
