import ErrorWithStatus from "../../exceptions/error_with_status.exception.js";
import { ReminderModel } from "../../models/reminder.js";

class ReminderService {
  constructor(reminder = ReminderModel, errorResponse = ErrorWithStatus) {
    this.reminder = reminder;
    this.errorResponse = errorResponse;
  }

  async addReminder({ message, receiver, event }) {
    try {
      await this.reminder.findOneAndDelete({
        receiver,
        event,
      });

      const reminder = new this.reminder({
        message,
        receiver,
        event,
      });

      const savedReminder = await reminder.save();
      return savedReminder;
    } catch (error) {
      console.error("Failed to add reminder:", error);
      throw error;
    }
  }
  async updateReminder(id, userId) {
    try {
      const reminder = await this.reminder.findOne({ _id: id });

      if (!reminder) {
        throw new this.errorResponse("Reminder not found", 404);
      }

      if (reminder.receiver !== userId) {
        throw new this.errorResponse("Not authorize to perform operation", 403);
      }

      reminder.isRead = true;

      const updatedReminder = await reminder.save();

      return {
        message: "Reminder is read successfully",
        data: updatedReminder,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }
  async deleteReminder(id, userId) {
    try {
      const reminder = await this.reminder.findByIdAndDelete(id);

      // if (!reminder) {
      //   throw new this.errorResponse("Reminder not found", 404);
      // }

      if (reminder.receiver !== userId) {
        throw new this.errorResponse("Not authorize to perform operation", 403);
      }

      return {
        message: "Reminder deleted successfully",
        data: null,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }
}

export default ReminderService;
