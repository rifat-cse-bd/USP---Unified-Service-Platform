export function notFound(req, res, next) {
  res.status(404);
  const err = new Error(`Not Found — ${req.originalUrl}`);
  next(err);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message,
    });
  }
  if (err.message === 'Only images and PDF are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
