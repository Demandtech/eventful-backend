import mongoose from "mongoose";

export const reminderSchema = mongoose.Schema({
  receiver: {
    type: String,
    ref: "User",
    required: true,
  },
  event: {
    type: String,
    required: true,
    ref: "BookEvent",
  },
  message: {
    type: String,
    required: true,
  },

  isRead: {
    type: Boolean,
    default: false,
    required: true,
  },
});
