import type { Response, Request, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";

// validating request body
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      const validatedData = schema.parse(req.body);

      // Replace request body with validated data
      req.body = validatedData;

      next(); // Validation passed, continue
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          errors: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};

// Validate URL parameters
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid parameters",
          details: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Validate query parameters
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid query parameters",
          details: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};
