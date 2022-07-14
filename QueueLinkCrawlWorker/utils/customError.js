class CustomError extends Error {
  constructor(message, statusCode) {
    super();
    Error.captureStackTrace(this, CustomError);
    this.statusCode = statusCode || 500;
  }
}

module.exports = CustomError;
