import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      nullable: false,
    },
    last_name: {
      type: String,
      nullable: false,
    },
    email: {
      type: String,
      nullable: false,
      unique: true,
    },
    user_type: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    password: {
      type: String,
      nullable: false,
    },
  },
  { timestamps: true }
);

export default userSchema;
