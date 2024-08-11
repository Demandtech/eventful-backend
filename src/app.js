import express from "express";
import authRoute from "./routes/auth.route.js";
import eventRoute from "./routes/event.route.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/events", eventRoute);

app.get("/", (_, res) => {
  res.status(200).json({
    message: "Welcome to Eventful API",
  });
});

app.get("*", (_, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
