import { Request, ErrorRequestHandler } from 'express';
import { errorResponse } from './responses';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  return errorResponse(req as Request, res, err);
};