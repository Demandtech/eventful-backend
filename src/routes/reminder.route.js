import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import ReminderController from "../controllers/reminder.controller.js";

const reminderRouter = Router();
const reminderController = new ReminderController();

reminderRouter.use(authMiddleware);

reminderRouter.delete("/:reminderId", reminderController.deleteReminder);
reminderRouter.get("/:reminderId", reminderController.updateReminder);

export default reminderRouter;
