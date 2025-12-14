import express from "express";
import {
  addSweet,
  updateSweet,
  deleteSweet,
  restockSweet,
  getSweets,
  purchaseSweet,
  purchaseSweets,
} from "../controllers/SweetController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "public/",
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/", getSweets);
router.get("/search", getSweets);

router.post("/", protect, adminOnly, upload.single("image"), addSweet);
router.put("/:id", protect, adminOnly, upload.single("image"), updateSweet);
router.delete("/:id", protect, adminOnly, deleteSweet);

router.post("/:id/restock", protect, adminOnly, restockSweet);
router.post("/:id/purchase", protect, purchaseSweet);
router.post("/cart-purchase", protect, purchaseSweets);
export default router;
