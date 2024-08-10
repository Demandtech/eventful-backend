import AuthServices from "../services/auth/auth.service.js";

export default class AuthController {
  constructor(service = new AuthServices()) {
    this.service = service;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register(req, res) {
    try {
      const newUser = await this.service.register(req.body);

      res.status(201).json(newUser);
    } catch (err) {
      res.status(err.status).json({ message: err.message, data: null });
    }
  }

  async login(req, res) {
    // console.log(req.body);
    try {
      const user = await this.service.login(req.body);

      res.status(200).json(user);
    } catch (err) {
      // console.log(err);
      res
        .status(err.status || 500)
        .json({
          message: err.message || "internal server error, please try again!",
          data: null,
        });
    }
  }
}
