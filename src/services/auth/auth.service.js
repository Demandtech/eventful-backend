import UserModel from "../../models/user.model.js";
import ErrorWithStatus from "../../exceptions/error_with_status.exception.js";
import bcrypt from "bcrypt";
import generateToken from "../../utils/generateToken.js";

export default class AuthServices {
  constructor(userModel = UserModel, errorResponse = ErrorWithStatus) {
    this.model = userModel;
    this.errorResponse = errorResponse;
  }

  async register({ last_name, first_name, email, password }) {
    try {
      const existingUser = await this.model.findOne({ email });

      if (existingUser) {
        throw new this.errorResponse("User with email already exist", 400);
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = new this.model({
        first_name,
        last_name,
        email,
        password: hashPassword,
      })

      await newUser.save();

      const userObj = newUser.toObject();

      delete userObj.password;

      const token = generateToken(userObj);

      return {
        message: "Register successfully",
        access_token: token,
        data: userObj,
      };
    } catch (err) {
      throw new this.errorResponse(
        err.message || "Internal server error, try again later!",
        err.status || 500
      );
    }
  }

  async login({ email, password }) {
    try {
      const user = await this.model.findOne({ email }).lean();
      const passwordMatch = await bcrypt.compare(password, user?.password);

      if (!user || !passwordMatch) {
        throw new ErrorWithStatus("email or password is incorrect", 400);
      }

      delete user.password;
      delete user.__v

      const token = generateToken(user);

      return {
        message: "Login Successfully",
        access_token: token,
        data: user,
      };
    } catch (err) {
      throw new ErrorWithStatus(
        err.message || "Internal server error, try again later",
        err.status || 500
      );
    }
  }
}
