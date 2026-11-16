class ApiError extends Error {
  constructor(statusCode, code, message = "An error occurred", details = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

