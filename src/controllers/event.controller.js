import EventService from "../services/event/event.service.js";

class EventController {
  constructor(service = new EventService()) {
    this.service = service;
    this.createEvent = this.createEvent.bind(this);
    this.allActiveEvents = this.allActiveEvents.bind(this);
    this.bookEvent = this.bookEvent.bind(this);
    this.userBookEvents = this.userBookEvents.bind(this);
    this.userEvents = this.userEvents.bind(this);
    this.eventAttendee = this.eventAttendee.bind(this);
    this.singleEvent = this.singleEvent.bind(this);
  }

  async createEvent(req, res) {
    try {
      const { _id: userId } = req.user;
      const { date, name, desc, time } = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized user" });
      }

      const result = await this.service.createEvent({
        date,
        name,
        desc,
        userId,
        time,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }
  async allActiveEvents(_, res) {
    try {
      const result = await this.service.allActiveEvents();

      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async bookEvent(req, res) {
    try {
      const { eventId } = req.params;
      const { _id: userId } = req.user;

      if (!eventId) {
        res.status(400).json({ message: "Event Id params is required" });
      }

      const result = await this.service.bookEvent({ userId, eventId });

      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async userBookEvents(req, res) {
    try {
      const { _id: userId } = req.user;

      const result = await this.service.userBookEvents(userId);

      res.status(200).json(result);
    } catch (error) {
      // console.log(error)
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async userEvents(req, res) {
    try {
      const { _id: userId } = req.user;

      const result = await this.service.userEvents(userId);

      res.status(200).json(result);
    } catch (error) {
      // console.log(error)
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async eventAttendee(req, res) {
    try {
      const { eventId } = req.params;
      const { _id: userId } = req.user;

      if (!eventId) {
        res.status(400).json({ message: "Event Id params is required" });
      }

      const result = await this.service.eventAttendee(eventId, userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }

  async singleEvent(req, res) {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        res.status(400).json({ message: "Event Id params is required" });
      }

      const result = await this.service.singleEvent(eventId);

      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "An error occured, please try again later!",
      });
    }
  }
}

export default EventController;
