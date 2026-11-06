import { Router } from "express";
import { z } from "zod";
import { prisma } from "./db.js";
import { authenticateToken } from "./middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const settings = await prisma.settings.upsert({
      where: {
        organizationId: req.user.organizationId,
      },
      update: {},
      create: {
        organizationId: req.user.organizationId,
      },
    });

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

router.put("/", async (req, res) => {
  const schema = z.object({
    defaultLowStockThreshold: z.number().int().min(0),
  });

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid threshold" });
  }

  try {
    const settings = await prisma.settings.upsert({
      where: {
        organizationId: req.user.organizationId,
      },
      update: result.data,
      create: {
        organizationId: req.user.organizationId,
        ...result.data,
      },
    });

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export default router;