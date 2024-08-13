import ReminderService from "../services/reminder/reminder.service.js";

class ReminderController {
  constructor(service = new ReminderService()) {
    this.service = service;
    this.updateReminder = this.updateReminder.bind(this);
    this.deleteReminder = this.deleteReminder.bind(this);
    this.allUserReminders = this.allUserReminders.bind(this);
  }

  async updateReminder(req, res) {
    try {
      const { _id: userId } = req.user;
      const { reminderId, ...updatedValue } = req.body;

      if (!reminderId) {
        res.status(400).json({ message: "Reminder id params is required" });
      }

      const result = await this.service.updateReminder({
        reminderId,
        userId,
        updatedValue,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async deleteReminder(req, res) {
    try {
      const { reminderId } = req.params;
      const { _id: userId } = req.user;

      if (!reminderId) {
        res.status(400).json({ message: "Reminder id params is required" });
      }

      const result = await this.service.deleteReminder(reminderId, userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async allUserReminders(req, res) {
    try {
      const { _id: userId } = req.user;

      const result = await this.service.allUserReminders(userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }
}

export default ReminderController;
