/**
 * Standard response helper
 * @param {Response} res
 * @param {number} statusCode
 * @param {boolean} success
 * @param {string} message
 * @param {Object|null} data
 * @param {Object|null} errors
 * @returns {Response}
 */
export const sendResponse = (
  res,
  statusCode,
  success,
  message = '',
  data = null,
  errors = null
) => {
  return res.status(statusCode).json({
    statusCode,
    success,
    message,
    data,
    errors
  });
};
