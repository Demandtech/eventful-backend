import AuthController from "../controllers/auth.controller.js";
import { Router } from "express";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import { registerSchema } from "../validations/auth.validation.js";

const authRoute = Router();

const authControllers = new AuthController();

authRoute.post(
  "/register",
  validateMiddleware(registerSchema),
  authControllers.register
);

authRoute.post("/login", authControllers.login);

export default authRoute;
