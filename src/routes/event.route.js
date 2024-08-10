import { Router } from "express";
import EventController from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import { createEventSchema } from "../validations/event.validation.js";

const eventController = new EventController();

const eventRoute = Router();

eventRoute.use(authMiddleware);
eventRoute.post(
  "/",
  validateMiddleware(createEventSchema),
  eventController.createEvent
);
eventRoute.get("/", eventController.userEvents);
eventRoute.get("/:eventId/attendee", eventController.eventAttendee);
eventRoute.get("/books", eventController.userBookEvents);
eventRoute.get("/upcoming", eventController.allActiveEvents);
eventRoute.post("/books/:eventId", eventController.bookEvent);
export default eventRoute;
