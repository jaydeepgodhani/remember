import { NextFunction, Request, Response } from "express";
import { CustomError, RespBody } from "../utils/types.js";

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Global error handler caught:", err);

  const statusCode: number = err.status || 500;
  const message: string = err.message || "Internal Server Error";

  const response: RespBody = {
    success: false,
    message,
    status: statusCode,
  };
  return res.status(statusCode).json(response);
};

export default errorHandler;
