import { AppError } from "./appError.ts";

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}
