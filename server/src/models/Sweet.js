import mongoose from "mongoose";

const SweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUri: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SweetModel = mongoose.model("Sweet", SweetSchema);

export default SweetModel;
