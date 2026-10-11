function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  // Express/body-parser errors (e.g. a malformed URL param) set `status` rather than `statusCode`.
  const statusCode = err.statusCode || err.status || 500;
  // Don't leak DB or internal error details to the client; log them instead.
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
