import logger from "../utils/logger.util.js";

/**
 * Global error handling middleware.
 */
const errorMiddleware = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message} - ${req.method} ${req.originalUrl}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'dev' && { stack: err.stack })
  });
};

export default errorMiddleware;
