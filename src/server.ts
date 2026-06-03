import express from "express";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import habitRoutes from "./routes/habitRoutes.ts";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env, isTestEnv } from "../env.ts";

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("dev", {
    skip: () => isTestEnv(),
  }),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/habits", habitRoutes);

export { app };
export default app;
