import Joi from "joi";

export const updateReminderSchema = Joi.object({
  reminderId: Joi.string().required(),
  isRead: Joi.boolean().required(),
});
