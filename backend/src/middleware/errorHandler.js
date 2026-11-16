const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  // Log unexpected errors
  if (!err.statusCode || err.statusCode >= 500) {
    req.log ? req.log.error(err) : console.error("Unhandled error:", err);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected internal server error occurred";
  const details = err.details || [];

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
}

module.exports = errorHandler;

