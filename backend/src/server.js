
import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import authRoutes from "./auth.routes.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import productRoutes from "./products.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import settingsRoutes from "./settings.routes.js";
import inventoryRoutes from "./inventory.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/inventory", inventoryRoutes);

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
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        organizationId: true,
        organization: {
          select: { name: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`StockFlow API running on port ${PORT}`);
});
