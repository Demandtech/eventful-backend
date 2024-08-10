import ErrorWithStatus from "../../exceptions/error_with_status.exception.js";
import { BookEventModel, EventModel } from "../../models/event.model.js";
import UserModel from "../../models/user.model.js";
import EventService from "./event.service.js";
import crypto from "crypto";

jest.mock("../../models/event.model.js");
jest.mock("../../models/user.model.js");
jest.mock("crypto");
jest.mock("../../exceptions/error_with_status.exception.js");

describe("EventService", () => {
  let eventService;
  let mockEvent;

  beforeEach(() => {
    const mockUserId = "12345";
    mockEvent = {
      _id: "67890",
      name: "Test Event",
      creator: mockUserId,
      description: "Test Description",
      date: "2024-08-09",
      time: "9:30PM",
      save: jest.fn().mockResolvedValue(undefined),
    };

    EventModel.mockImplementation(() => mockEvent);
    eventService = new EventService(
      EventModel,
      BookEventModel,
      ErrorWithStatus,
      UserModel
    );

    UserModel.findById.mockReset();
    EventModel.findOne.mockReset();
    ErrorWithStatus.mockReset();
  });

  describe("Create Event", () => {
    it("should create an event successfully", async () => {
      const mockUserId = "12345";

      UserModel.findById.mockResolvedValue({ _id: mockUserId });
      EventModel.findOne.mockResolvedValue(null);

      const result = await eventService.createEvent({
        userId: mockUserId,
        name: "Test Event",
        desc: "Test Description",
        date: "2024-08-09",
        time: "9:30PM",
      });

      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(EventModel.findOne).toHaveBeenCalledWith({
        creator: mockUserId,
        name: "Test Event",
        date: "2024-08-09",
        time: "9:30PM",
      });

      expect(mockEvent.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: "Event created successfully",
        data: mockEvent,
      });
    });

    it("should throw an error if the user is not found", async () => {
      const mockUserId = "12345";

      UserModel.findById.mockResolvedValue(null);

      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(
        eventService.createEvent({
          userId: mockUserId,
          name: "Test Event",
          desc: "Test Description",
          date: "2024-08-09",
          time: "9:30PM",
        })
      ).rejects.toThrow("User not found");
      expect(ErrorWithStatus).toHaveBeenCalledWith("User not found", 404);
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
    });

    it("should handle unexpected errors", async () => {
      const mockUserId = "12345";

      UserModel.findById.mockRejectedValue(new Error("Unexpected error"));

      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(
        eventService.createEvent({
          userId: mockUserId,
          name: "Test Event",
          desc: "Test Description",
          date: "2024-08-09",
          time: "9:30PM",
        })
      ).rejects.toThrow("Unexpected error");
      expect(ErrorWithStatus).toHaveBeenCalledWith("Unexpected error", 500);
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe("All active events", () => {
    it("should return all active events", async () => {
      const mockCurrentDate = new Date();
      const mockActiveEvents = [
        {
          _id: "67890",
          name: "Test Event 1",
          date: new Date(mockCurrentDate.getTime() + 10000),
          time: "9:30PM",
        },
        {
          _id: "67891",
          name: "Test Event 2",
          date: new Date(mockCurrentDate.getTime() + 50000),
          time: "10:30PM",
        },
      ];

      EventModel.find.mockResolvedValue(mockActiveEvents);

      const result = await eventService.allActiveEvents();

      expect(EventModel.find).toHaveBeenCalledWith({
        date: { $gte: mockCurrentDate },
      });

      expect(result).toEqual({
        message: "All upcoming events",
        data: mockActiveEvents,
      });
    });

    it("should handle errors and throw an error response", async () => {
      const mockError = new Error("Unexpected error");
      EventModel.find.mockRejectedValue(mockError);

      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(eventService.allActiveEvents()).rejects.toThrow(
        "Unexpected error"
      );
    });
  });

  describe("bookEvent", () => {
    it("should book an event successfully", async () => {
      const mockEventId = "event123";
      const mockUserId = "user123";
      const mockEvent = { _id: mockEventId };
      const mockTicketNumber = "Ticket-ABCDE";

      crypto.randomBytes.mockReturnValue(Buffer.from("ABCDE", "hex"));

      EventModel.findById.mockResolvedValue(mockEvent);

      const mockSavedBooking = {
        _id: "booking123",
        event: mockEventId,
        ticket_number: mockTicketNumber,
        attendee: mockUserId,
      };

      BookEventModel.prototype.save = jest
        .fn()
        .mockResolvedValue(mockSavedBooking);

      const mockPopulatedBooking = {
        ...mockSavedBooking,
        event: { _id: mockEventId, name: "Test Event" },
        attendee: { _id: mockUserId, name: "Test User" },
      };

      const mockPopulate = jest.fn().mockReturnThis();
      BookEventModel.findById = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });

      mockPopulate.mockResolvedValue(mockPopulatedBooking);

      try {
        const result = await eventService.bookEvent({
          eventId: mockEventId,
          userId: mockUserId,
        });

        expect(EventModel.findById).toHaveBeenCalledWith(mockEventId);
        expect(BookEventModel.prototype.save).toHaveBeenCalled();
        expect(BookEventModel.findById).toHaveBeenCalled();
        expect(mockPopulate).toHaveBeenCalledWith({
          path: "event",
        });
        expect(mockPopulate).toHaveBeenCalledWith({
          path: "attendee",
          select: "-password",
        });
        expect(result).toEqual({
          message: "Booking successful",
          data: mockPopulatedBooking,
        });
      } catch (error) {
        console.error("Error in test:", error);
        throw error; // Re-throw the error to fail the test
      }
    });

    it("should throw an error if the event is not found", async () => {
      const mockEventId = "event123";
      const mockUserId = "user123";

      EventModel.findById.mockResolvedValue(null); // No event found

      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(
        eventService.bookEvent({
          eventId: mockEventId,
          userId: mockUserId,
        })
      ).rejects.toThrow("Event not found"); // Check for specific message
    });

    it("should throw a generic error when an unexpected error occurs", async () => {
      const mockEventId = "event123";
      const mockUserId = "user123";

      EventModel.findById.mockRejectedValue(new Error("Unexpected error"));

      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(
        eventService.bookEvent({
          eventId: mockEventId,
          userId: mockUserId,
        })
      ).rejects.toThrow("Unexpected error"); // Check for specific message
    });
  });
});
