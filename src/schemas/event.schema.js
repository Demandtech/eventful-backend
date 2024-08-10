import mongoose from "mongoose";

export const eventShema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
      ref: "User",
    },
  },
  {
    timestamp: true,
  }
);

export const bookEvent = mongoose.Schema(
  {
    ticket_number: {
      type: String,
      required: true,
      unique: true,
    },
    event: {
      type: String,
      ref: "Event",
      required: true,
    },

    attendee: {
      type: String,
      ref: "User",
      required: true,
    },
    creator: {
      type: String,
      ref: "User",
      required: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamp: true,
  }
);
