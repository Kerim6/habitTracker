import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.ts";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If it's a known operational error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unknown/unexpected error
  console.error("Unexpected Error:", err);

  return res.status(500).json({
    error: "Internal Server Error",
  });
};
