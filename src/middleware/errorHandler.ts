import { NextFunction, Request, Response } from "express";
import { CustomError, RespBody } from "../utils/types";

const errorHandler = async (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler caught:", err);

  const statusCode: number = err.status || 500;
  const message = err.message || "Internal Server Error";

  const response: RespBody = {
    success: false,
    message,
    status: statusCode,
  };
  res.status(statusCode).json(response);
};

export default errorHandler;
