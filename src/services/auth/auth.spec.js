import bcrypt from "bcrypt";
import ErrorWithStatus from "../../exceptions/error_with_status.exception.js";
import UserModel from "../../models/user.model.js";
import AuthServices from "../auth/auth.service.js";
import generateToken from "../../utils/generateToken.js";

jest.mock("../../models/user.model.js");
jest.mock("bcrypt");
jest.mock("../../exceptions/error_with_status.exception.js");
jest.mock("../../utils/generateToken.js");

describe("AuthServices", () => {
  let authServices;

  beforeEach(() => {
    authServices = new AuthServices();
    UserModel.findOne.mockReset();
    UserModel.prototype.save.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
    ErrorWithStatus.mockReset();
    generateToken.mockReset();
  });

  describe("Register user", () => {
    const mockUser = {
      last_name: "Doe",
      first_name: "John",
      email: "john.doe@example.com",
      password: "password123",
    };

    it("should throw an error if user already exists", async () => {
      UserModel.findOne.mockResolvedValue({ email: mockUser.email });

      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(authServices.register(mockUser)).rejects.toThrow(
        "User with email already exist"
      );
      expect(ErrorWithStatus).toHaveBeenCalledWith(
        "User with email already exist",
        400
      );
    });

    it("should throw an error if saving user fails", async () => {
      UserModel.findOne.mockResolvedValue(null);

      bcrypt.hash.mockResolvedValue("hashedPassword");

      UserModel.prototype.save.mockRejectedValue(new Error("Save failed"));
      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(authServices.register(mockUser)).rejects.toThrow(
        "Save failed"
      );
      expect(ErrorWithStatus).toHaveBeenCalledWith("Save failed", 500);
    });

    it("should register a new user successfully", async () => {
      UserModel.findOne.mockResolvedValue(null);

      bcrypt.hash.mockResolvedValue("hashedPassword");

      const mockSavedUser = {
        ...mockUser,
        password: "hashedPassword",
        toObject: jest.fn().mockReturnValue({
          ...mockUser,
          password: "hashedPassword",
        }),
      };

      UserModel.mockImplementation(() => {
        return {
          save: jest.fn().mockResolvedValue(mockSavedUser),
          toObject: jest.fn().mockReturnValue({
            ...mockUser,
            password: "hashedPassword",
          }),
        };
      });

      const mockToken = "mockToken";
      generateToken.mockReturnValue(mockToken);

      const result = await authServices.register(mockUser);

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);

      expect(UserModel).toHaveBeenCalledWith({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
        password: "hashedPassword",
      });

      expect(result).toEqual({
        message: "Register successfully",
        access_token: mockToken,
        data: {
          last_name: "Doe",
          first_name: "John",
          email: "john.doe@example.com",
        },
      });
      expect(result.data.password).toBeUndefined();
    });
  });

  describe("Login user", () => {
    const mockUser = {
      last_name: "Doe",
      first_name: "John",
      email: "john.doe@example.com",
      password: "hashedPassword",
      toObject: jest.fn().mockReturnValue({
        last_name: "Doe",
        first_name: "John",
        email: "john.doe@example.com",
      }),
    };

    it("should return login successful response with user data and access token", async () => {
      const email = "john.doe@example.com";
      const password = "password123";

      UserModel.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue("mockToken");

      const result = await authServices.login({ email, password });

      expect(UserModel.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, "hashedPassword");
      expect(generateToken).toHaveBeenCalledWith({
        last_name: "Doe",
        first_name: "John",
        email: "john.doe@example.com",
      });

      expect(result).toEqual({
        message: "Login Successfully",
        access_token: "mockToken",
        data: {
          last_name: "Doe",
          first_name: "John",
          email: "john.doe@example.com",
        },
      });
    });

    it("should throw error when email or password is incorrect", async () => {
      const email = "john.doe@example.com";
      const password = "wrongPassword";

      UserModel.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(authServices.login({ email, password })).rejects.toThrow(
        "email or password is incorrect"
      );
      expect(ErrorWithStatus).toHaveBeenCalledWith(
        "email or password is incorrect",
        400
      );
    });

    it("should throw internal server error when an error occurs", async () => {
      const email = "john.doe@example.com";
      const password = "password123";

      UserModel.findOne.mockRejectedValue(new Error());
      
      ErrorWithStatus.mockImplementation((message, status) => {
        const error = new Error(message);
        error.status = status;
        return error;
      });

      await expect(authServices.login({ email, password })).rejects.toThrow(
        "Internal server error, try again later"
      );
      expect(ErrorWithStatus).toHaveBeenCalledWith(
        "Internal server error, try again later",
        500
      );
    });
  });
});
