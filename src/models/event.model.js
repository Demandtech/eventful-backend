import mongoose from "mongoose";
import { eventShema, bookEvent } from "../schemas/event.schema.js";

export const EventModel = mongoose.model("Event", eventShema);
export const BookEventModel = mongoose.model("BookEvent", bookEvent);
