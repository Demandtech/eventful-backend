import moment from "moment";
import cron from "node-cron";
import ReminderService from "../services/reminder/reminder.service.js";
import { ReminderModel } from "../models/reminder.js";

const scheduleEventReminder = (booking) => {
  const reminderService = new ReminderService(ReminderModel);
  const eventDate = moment(booking.event.date);
  const eventTime = booking.event.time.toLowerCase();
  const [time, modifier] = eventTime.split(/([ap]m)/);
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "pm" && hours < 12) {
    hours += 12;
  } else if (modifier === "am" && hours === 12) {
    hours = 0;
  }

  eventDate.hours(hours).minutes(minutes);

  const scheduleReminder = async (timeBefore, message) => {
    if (timeBefore.isValid()) {
      const cronTime = `${timeBefore.minutes()} ${timeBefore.hours()} ${timeBefore.date()} ${
        timeBefore.month() + 1
      } *`;

      cron.schedule(cronTime, async () => {
        try {
          await reminderService.addReminder({
            message,
            receiver: booking.attendee._id,
            event: booking.event._id,
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  };

  const dayBefore = eventDate.clone().subtract(1, "days");
  const hourBefore = eventDate.clone().subtract(1, "hours");
  const thirtyMinutesBefore = eventDate.clone().subtract(30, "minutes");

  scheduleReminder(
    dayBefore,
    `${booking.event.name} event will start tomorrow at ${eventTime}`
  );
  scheduleReminder(
    hourBefore,
    `${booking.event.name} event will start in 1 hour at ${eventTime}`
  );
  scheduleReminder(
    thirtyMinutesBefore,
    `${booking.event.name} event will start in 30 minutes at ${eventTime}`
  );
  scheduleReminder(eventDate, `${booking.event.name} event will start now`);
};

export default scheduleEventReminder;
