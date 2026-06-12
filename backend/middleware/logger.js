// Custom request logging middleware with colored console outputs
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Use 'finish' event to log after the response headers are sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toLocaleTimeString();
    
    // Status code colorization
    let statusColor = '\x1b[32m'; // Green for 2xx
    if (res.statusCode >= 300 && res.statusCode < 400) {
      statusColor = '\x1b[36m'; // Cyan for 3xx
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      statusColor = '\x1b[33m'; // Yellow for 4xx
    } else if (res.statusCode >= 500) {
      statusColor = '\x1b[31m'; // Red for 5xx
    }
    
    const resetColor = '\x1b[0m';
    const methodColor = '\x1b[35m'; // Magenta for methods
    
    console.log(
      `[HTTP] ${timestamp} | ${methodColor}${req.method.padEnd(6)}${resetColor} | ${req.originalUrl} | Status: ${statusColor}${res.statusCode}${resetColor} | Time: ${duration}ms`
    );
  });
  
  next();
};

module.exports = { requestLogger };
