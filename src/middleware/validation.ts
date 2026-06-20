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
      next(error);
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
      next(error);
    }
  };
};
