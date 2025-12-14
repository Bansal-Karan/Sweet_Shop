import mongoose from "mongoose";

export const connectDB = async () => {
  const mongo_uri = process.env.MONGODB_URI;
  try {
    const instance = mongoose.connect(mongo_uri, {
      dbName: "sweet_shop",
    });

    console.log(
      "Database Connected Successfully:",
      (await instance).connection.name
    );
  } catch (error) {
    console.log("Error connecting Database: ", error);
  }
};
