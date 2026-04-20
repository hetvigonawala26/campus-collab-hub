const { AppError } = require("../utils/appError");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const message =
    statusCode >= 500 && (process.env.NODE_ENV || "development") === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  if ((process.env.NODE_ENV || "development") !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({ message });
}

module.exports = { errorHandler };

