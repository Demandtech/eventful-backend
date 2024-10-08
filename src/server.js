import config from "../config/configs.js";
import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
  try {
    await mongoose.connect(config.databaseUrl);
    console.log("DB connected");

    app.listen(config.serverPort, () => {
      console.log("Server is running on port: ", config.serverPort);
    });
  } catch (error) {
    console.log("DATABASE_ERROR: ", error.message);
  }
};

startServer();
