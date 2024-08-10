import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/apiError';

type ResponseBodyJson = Record<string, unknown> | Array<unknown>;
type ExpressFunction = (req: Request, res: Response, next: NextFunction) => void;


export function errorResponse(req: Request, res: Response, err: ApiError) {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
}

type FunctionForFullJsonWrap = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ResponseBodyJson>;

export function jsonWrap(fn: FunctionForFullJsonWrap): ExpressFunction {
  return (req: Request, res: Response, next: NextFunction) => {

      fn(req, res, next).then(body => res.status(200).json(body)).catch(err => errorResponse(req, res, err));
  
  };
}

type FunctionForSimpleWrap = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export function simpleWrap(fn: FunctionForSimpleWrap): ExpressFunction {
  return function (req, res, next) {
    fn(req, res, next)
      .catch(err => errorResponse(req, res, err));
  };
}