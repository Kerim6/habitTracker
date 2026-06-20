import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.ts";
import { ZodError } from "zod";
import env from "../../env.ts";

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

  if (err instanceof ZodError) {
    return res.status(400).json({
      errors: err.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  // Unknown/unexpected error
  console.error("Unexpected Error:", err);

  if (env.APP_STAGE === "dev") {
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
};
