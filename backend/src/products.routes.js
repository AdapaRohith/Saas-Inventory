
import { Router } from "express";
import { z } from "zod";
import { prisma } from "./db.js";
import { authenticateToken } from "./middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

const productSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  quantityOnHand: z.number().int().min(0).default(0),
  costPrice: z.number().min(0).nullable().optional(),
  sellingPrice: z.number().min(0).nullable().optional(),
  lowStockThreshold: z.number().int().min(0).nullable().optional(),
});

router.post("/", async (req, res) => {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...result.data,
        organizationId: req.user.organizationId,
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "SKU already exists" });
    }

    res.status(500).json({ message: "Failed to create product" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { organizationId: req.user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.put("/:id", async (req, res) => {
  const result = productSchema.partial().safeParse(req.body);

  if (!result.success || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const existing = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: result.data,
    });

    res.json({ product });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "SKU already exists" });
    }

    res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await prisma.product.deleteMany({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
