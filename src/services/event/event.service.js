import ErrorWithStatus from "../../exceptions/error_with_status.exception.js";
import { EventModel, BookEventModel } from "../../models/event.model.js";
import UserModel from "../../models/user.model.js";
import crypto from "crypto";
import generateQrCode from "../../utils/generateQrCode.js";
import scheduleEventReminder from "../../utils/scheduleReminder.js";

class EventService {
  constructor(
    eventModel = EventModel,
    bookModel = BookEventModel,
    errorResponse = ErrorWithStatus,
    userModel = UserModel,
    reminderSheduler = scheduleEventReminder
  ) {
    this.model = eventModel;
    this.bookModel = bookModel;
    this.errorResponse = errorResponse;
    this.userModel = userModel;
    this.reminder = reminderSheduler;
  }

  async createEvent({ userId, name, desc, date, time }) {
    try {
      const user = await this.userModel.findById(userId);

      const existingEvent = await this.model.findOne({
        creator: userId,
        name,
        date,
        time,
      });

      if (existingEvent) {
        throw new this.errorResponse("Event is already running", 400);
      }

      const currentDate = new Date();
      const eventDate = new Date(date);

      if (eventDate < currentDate) {
        throw new this.errorResponse("Event date must be in the future", 400);
      }

      if (!user) {
        throw new this.errorResponse("User not found", 404);
      }

      const event = new this.model({
        creator: userId,
        name,
        description: desc,
        date,
        time,
      });

      await event.save();

      return {
        message: "Event created successfully",
        data: event,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, try again later!",
        error.status || 500
      );
    }
  }

  async allActiveEvents() {
    try {
      const currentDate = new Date();

      const activeEvents = await this.model.find({
        date: { $gte: currentDate },
      });

      return {
        message: "All upcoming events",
        data: activeEvents,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        500
      );
    }
  }

  async bookEvent({ eventId, userId }) {
    try {
      const event = await this.model.findById(eventId).populate("creator");

      if (!event) {
        throw new this.errorResponse("Event not found", 404);
      }

      const ticket_number = `Ticket-${crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase()}`;

      const qrCode = await generateQrCode(ticket_number);

      const booking = new this.bookModel({
        event: eventId,
        ticket_number,
        attendee: userId,
        creator: event.creator._id,
        qrCodeUrl: qrCode,
      });

      await booking.save();

      const populatedBooking = await this.bookModel
        .findById(booking._id)
        .populate({
          path: "event",
        })
        .populate({
          path: "attendee",
          select: "-password",
        })
        .populate({
          path: "creator",
          select: "-password",
        });
      this.reminder(populatedBooking);
      return {
        message: "Booking successful",
        data: populatedBooking,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }

  async userBookEvents(userId) {
    try {
      const bookEvents = await this.bookModel
        .find({ attendee: userId })
        .populate({
          path: "event",
        });

      return {
        message: "All user booked events",
        data: bookEvents,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }

  async userEvents(userId) {
    try {
      const eventCreated = await this.model.find({ creator: userId });

      return {
        message: "User events list",
        data: eventCreated,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }

  async eventAttendee(eventId, userId) {
    try {
      const attendee = await this.bookModel
        .find({ event: eventId, creator: userId })
        .populate({
          path: "attendee",
          select: "-password -__v -createdAt -updatedAt",
        })
        .populate({
          path: "creator",
          select: "-password -__v -createdAt -updatedAt",
        });

      return {
        message: "Event attendee",
        data: attendee,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }

  async singleEvent(eventId) {
    try {
      const event = await this.model
        .findById(eventId)
        .populate({
          path: "creator",
          select: "-password -__v -createdAt -updatedAt",
        })
        .lean();

      if (!event) {
        throw new this.errorResponse("Event not found", 404);
      }

      delete event.__v;

      return {
        message: "Single event",
        data: event,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }

  async eventByTicket(ticketNumber) {
    try {
      const event = await this.bookModel
        .findOne({
          ticket_number: ticketNumber,
        })
        .populate({
          path: "event",
          select: "-__v -creator",
        })
        .populate({
          path: "creator",
          select: "-password -__v -createdAt -updatedAt",
        })
        .populate({
          path: "attendee",
          select: "-password -__v -createdAt -updatedAt",
        })
        .lean();

      if (!event) {
        throw new ErrorWithStatus("Event not found", 404);
      }

      delete event.qrCodeUrl;
      delete event.__v;

      return {
        message: "Ticket is valid",
        date: event,
      };
    } catch (error) {
      throw new this.errorResponse(
        error.message || "An error occured, please try again later!",
        error.status || 500
      );
    }
  }
}
export default EventService;
