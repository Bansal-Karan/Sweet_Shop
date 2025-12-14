import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import SweetModel from "../models/Sweet.js";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

export const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const fileWithExt = parts.pop(); // doodh_peda.jpg
  const folder = parts.slice(parts.indexOf("upload") + 1).join("/");

  const fileName = fileWithExt.split(".")[0];
  return `${folder}/${fileName}`;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// admin only
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const addSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const image = req.file;

    if (!name || !category || price < 0 || quantity < 0)
      return res.status(400).json({ message: "Invalid data" });

    if (!image) return res.status(400).json({ message: "Image is required" });

    const exists = await SweetModel.findOne({ name });
    if (exists)
      return res.status(409).json({ message: "Sweet already exists" });

    const uploadRes = await cloudinary.uploader.upload(image.path, {
      folder: "sweets",
    });

    fs.unlink(image.path);

    const sweet = await SweetModel.create({
      name,
      category,
      price,
      quantity,
      imageUri: uploadRes.secure_url,
    });

    res.status(201).json(sweet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ADMIN: Update Sweet
export const updateSweet = async (req, res) => {
  const { id } = req.params;
  const image = req.file;

  let uploadRes;

  if (image) {
    uploadRes = await cloudinary.uploader.upload(image.path, {
      folder: "sweets",
    });

    fs.unlink(image.path);
  }
  if (!isValidObjectId(id))
    return res.status(400).json({ message: "Invalid ID" });

  const sweet = await SweetModel.findOne({ _id: id });

  if (sweet.imageUri) {
    const publicId = getPublicIdFromUrl(sweet.imageUri);

    const deleteRes = await cloudinary.uploader.destroy(publicId);
  }

  const updatedSweet = await SweetModel.findByIdAndUpdate(
    id,
    {
      ...req.body,
      imageUri: uploadRes?.secure_url,
    },
    {
      new: true,
    }
  );

  if (!sweet) return res.status(404).json({ message: "Sweet not found" });

  res.json(updatedSweet);
};

// ADMIN: Delete Sweet
export const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID" });

    const sweet = await SweetModel.findByIdAndDelete(id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    if (sweet.imageUri) {
      const publicId = getPublicIdFromUrl(sweet.imageUri);
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Sweet deleted" });
  } catch (error) {
    console.log("Error while deleting sweet", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ADMIN: Restock
export const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    const sweet = await SweetModel.findById(id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    sweet.quantity = quantity;
    await sweet.save();

    res.json(sweet);
  } catch (error) {
    console.log("Error While restocking sweet", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// USER: Get / Search
export const getSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: "i" };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await SweetModel.find(query);
    res.json(sweets);
  } catch (error) {
    console.log("Error while fetching sweets", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// USER: Purchase
export const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await SweetModel.findById(id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    if (sweet.quantity <= 0)
      return res.status(400).json({ message: "Out of stock" });

    sweet.quantity -= 1;
    await sweet.save();

    res.json({ message: "Purchased successfully" });
  } catch (error) {
    console.log("Error while purchasing sweet", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// USER: Purchases
export const purchaseSweets = async (req, res) => {
  try {
    const { cart } = req.body;

    console.log(cart);

    // 1. Validate everything first
    for (const { id, quantity } of cart) {
      const sweet = await SweetModel.findById(id);

      if (!sweet) return res.status(404).json({ message: "Sweet not found" });

      if (sweet.quantity < quantity)
        return res.status(400).json({
          message: `Out of stock for ${sweet.name}`,
        });
    }

    // 2. Apply updates
    for (const { id, quantity } of cart) {
      await SweetModel.findByIdAndUpdate(id, {
        $inc: { quantity: -quantity },
      });
    }

    res.json({ message: "Purchased successfully" });
  } catch (error) {
    console.error("Error while purchasing sweet", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
