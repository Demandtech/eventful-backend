import ReminderService from "../services/reminder/reminder.service.js";

class ReminderController {
  constructor(service = new ReminderService()) {
    this.service = service;
    this.updateReminder = this.updateReminder.bind(this);
    this.deleteReminder = this.deleteReminder.bind(this);
  }

  async updateReminder(req, res) {
    try {
      const { reminderId } = req.params;
      const { _id: userId } = req.user;

      if (!reminderId) {
        res.status(400).json({ message: "Reminder id params is required" });
      }

      const result = await this.service.updateReminder(reminderId, userId);

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
}

export default ReminderController;
