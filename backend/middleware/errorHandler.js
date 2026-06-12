// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler] Stack trace:', err.stack);

  const statusCode = err.status || 500;
  const response = {
    message: err.message || 'Something went wrong on the server!',
  };

  // Provide detailed error stack only in development mode
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 Route Not Found Middleware
const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

module.exports = { errorHandler, notFoundHandler };
