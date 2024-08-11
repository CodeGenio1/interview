import { Request, ErrorRequestHandler } from 'express';
import { errorResponse } from './responses';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
}