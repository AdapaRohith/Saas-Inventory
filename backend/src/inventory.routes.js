
import express from "express";
import { prisma } from "./db.js";
import { authenticateToken } from "./middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

function validateInput(body, requireQuantity = true) {
  const { quantity, note } = body;

  if (
    requireQuantity &&
    (!Number.isInteger(quantity) || quantity <= 0)
  ) {
    return "Quantity must be a positive integer.";
  }

  if (note !== undefined && typeof note !== "string") {
    return "Note must be a string.";
  }

  if (typeof note === "string" && note.length > 500) {
    return "Note cannot exceed 500 characters.";
  }

  return null;
}

async function updateStock(req, res, changeType) {
  try {
    const { productId } = req.params;
    const { quantity, note } = req.body;

    const validationError = validateInput(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: productId,
          organizationId: req.user.organizationId,
        },
      });

      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      const previousQuantity = product.quantityOnHand;

      const newQuantity =
        changeType === "STOCK_IN"
          ? previousQuantity + quantity
          : previousQuantity - quantity;

      if (newQuantity < 0) {
        const error = new Error(
          "Insufficient stock. Available quantity: " +
            previousQuantity
        );
        error.statusCode = 400;
        throw error;
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          quantityOnHand: newQuantity,
        },
      });

      const activity = await tx.inventoryActivity.create({
        data: {
          organizationId: req.user.organizationId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          changeType,
          previousQuantity,
          newQuantity,
          quantityChange: newQuantity - previousQuantity,
          note: note?.trim() || null,
        },
      });

      return {
        product: updatedProduct,
        activity,
      };
    });

    return res.status(200).json({
      message: "Stock updated successfully.",
      product: result.product,
      activity: result.activity,
    });
  } catch (error) {
    console.error("Inventory update error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to update stock.",
    });
  }
}

router.post("/stock-in/:productId", (req, res) => {
  return updateStock(req, res, "STOCK_IN");
});

router.post("/stock-out/:productId", (req, res) => {
  return updateStock(req, res, "STOCK_OUT");
});

router.post("/adjust/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, note } = req.body;

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        message: "Quantity must be a non-negative integer.",
      });
    }

    const validationError = validateInput(req.body, false);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: productId,
          organizationId: req.user.organizationId,
        },
      });

      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      const previousQuantity = product.quantityOnHand;

      const updatedProduct = await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          quantityOnHand: quantity,
        },
      });

      const activity = await tx.inventoryActivity.create({
        data: {
          organizationId: req.user.organizationId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          changeType: "ADJUSTMENT",
          previousQuantity,
          newQuantity: quantity,
          quantityChange: quantity - previousQuantity,
          note: note?.trim() || null,
        },
      });

      return {
        product: updatedProduct,
        activity,
      };
    });

    return res.status(200).json({
      message: "Stock adjusted successfully.",
      product: result.product,
      activity: result.activity,
    });
  } catch (error) {
    console.error("Stock adjustment error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to adjust stock.",
    });
  }
});

router.get("/activities", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Invalid pagination. Limit must be between 1 and 100.",
      });
    }

    const organizationId = req.user.organizationId;

    const [activities, total] = await Promise.all([
      prisma.inventoryActivity.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.inventoryActivity.count({
        where: {
          organizationId,
        },
      }),
    ]);

    return res.status(200).json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Activity history error:", error);

    return res.status(500).json({
      message: "Failed to fetch inventory activities.",
    });
  }
});

export default router;
