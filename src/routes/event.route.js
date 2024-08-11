import { Router } from "express";
import EventController from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import { createEventSchema } from "../validations/event.validation.js";

const eventController = new EventController();

const eventRoute = Router();

// Single and Shareable event
eventRoute.get("/:eventId", eventController.singleEvent);

eventRoute.use(authMiddleware);
eventRoute.post(
  "/",
  validateMiddleware(createEventSchema),
  eventController.createEvent
);

eventRoute.get("/", eventController.userEvents);
eventRoute.get("/user/booking", eventController.userBookEvents);

eventRoute.get("/:eventId/attendee", eventController.eventAttendee);
eventRoute.get("/upcoming", eventController.allActiveEvents);
eventRoute.post("/bookings/:eventId", eventController.bookEvent);
export default eventRoute;
