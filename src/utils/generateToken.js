import jwt from "jsonwebtoken";
import config from "../../config/configs.js";

export default (user) => {
  return jwt.sign(
    {
      user_type: user.user_type,
      _id: user._id,
      sub: user._id,
    },
    config.jwtSecret,
    {
      expiresIn: "30days",
    }
  );
};
