import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export { app };
export default app;
