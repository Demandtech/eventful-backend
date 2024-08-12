import mongoose from "mongoose";
import {reminderSchema} from "../schemas/reminder.js";

export const ReminderModel = mongoose.model(
  "Reminder",
  reminderSchema
);
