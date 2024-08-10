export const validateMiddleware = (schema) => {
  return (req, res, next) => {
    if (schema) {
      const result = schema.validate(req.body);

      if (result.error) {
        
        const errors = result.error.details
          .map((detail) => detail.message)
          .join(", ");

        return res.status(422).json({ message: "Validation error", errors });
      }
    }
    next();
  };
};
