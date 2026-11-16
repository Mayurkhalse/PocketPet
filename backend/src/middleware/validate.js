const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (result.body) req.body = result.body;
    if (result.query) req.query = result.query;
    if (result.params) req.params = result.params;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      return next(new ApiError(400, "VALIDATION_ERROR", "Invalid request data", details));
    }
    next(error);
  }
};

module.exports = validate;

