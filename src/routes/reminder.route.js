import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import ReminderController from "../controllers/reminder.controller.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import { updateReminderSchema } from "../validations/reminder.validation.js";

const reminderRouter = Router();
const reminderController = new ReminderController();

reminderRouter.use(authMiddleware);

reminderRouter.get("/", reminderController.allUserReminders);
reminderRouter.put(
  "/",
  validateMiddleware(updateReminderSchema),
  reminderController.updateReminder
);
reminderRouter.delete("/:reminderId", reminderController.deleteReminder);

export default reminderRouter;
