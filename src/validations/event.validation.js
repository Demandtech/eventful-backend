import Joi from "joi";

export const createEventSchema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string()
    .required()
    .regex(/^([1-9]|1[0-2]):[0-5][0-9](?:AM|PM|am|pm)$/)
    .messages({
      "string.pattern.base":
        "Time must be in the format H:MM AM/PM (e.g., 9:30PM, 9:30am)",
    }),
});
