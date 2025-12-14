import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

//Routes imports

import UserRoutes from "./routes/UserRoutes.js";
import SweetRoutes from "./routes/SweetRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  cors({
    origin: "sweet-shop-5llz.vercel.app",
    credentials: true,
  })
);

app.use("/api/auth", UserRoutes);
app.use("/api/sweets", SweetRoutes);

app.get("/", (req, res) => {
  res.send("This is home route");
});

const port = process.env.PORT;

connectDB().then(() =>
  app.listen(port, () => {
    console.log(`Server Running on http://localhost:${port}`);
  })
);
