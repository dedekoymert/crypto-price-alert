import { NextFunction, Request, Response } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.status) {
    res.status(err.status).json({
      error: {
        message: err.message,
      }
    });
  } else {
    res.status(500).json({
      error: {
        message: 'Internal Server Error',
      }
    });
  }
};

export default errorHandler;