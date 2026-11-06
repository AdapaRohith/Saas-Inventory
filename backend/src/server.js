
import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import authRoutes from "./auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "StockFlow API is running" });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(503).json({ status: "Error", database: "Disconnected" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`StockFlow API running on port ${PORT}`);
});
