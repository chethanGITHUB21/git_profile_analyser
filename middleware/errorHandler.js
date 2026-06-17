// Centralized error handler middleware
module.exports = (err, req, res, next) => {
  // Normalize error
  const status = err.status || (err.response && err.response.status) || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || (err.response && err.response.data) || null;

  // Log server-side
  if (status >= 500) {
    console.error('[ERROR]', message, { status, details, stack: err.stack });
  } else {
    console.warn('[WARN]', message, { status });
  }

  res.status(status).json({
    error: {
      message,
      status,
      details,
    },
  });
};
