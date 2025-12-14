import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      username,
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error creating user", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email,
    });

    if (!user) {
      res.status(400).json({
        message: "INVALID CREDENTIALS",
      });
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(400).json({
        message: "INVALID CREDENTIALS",
      });
      return;
    }

    const token = jwt.sign(
      { email: user.email, _id: user._id, role: "Customer" },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        message: "Login Successful",
      });
  } catch (error) {
    console.log("Error while logging in:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(400).json({
        message: "INVALID CREDENTIALS",
      });
    }

    if (password !== process.env.ADMIN_PASS) {
      return res.status(400).json({
        message: "INVALID CREDENTIALS",
      });
    }

    const token = jwt.sign(
      {
        role: "Admin",
        email,
      },
      process.env.JWT_SECRET_KEY
    );

    res.status(200).cookie("token", token, cookieOptions).json({
      token,
      message: "Admin Login Successful",
    });
  } catch (error) {
    console.log("Error while logging in:", error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.json(user);
};
