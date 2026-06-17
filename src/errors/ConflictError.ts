import { AppError } from "./appError.ts";

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
