import { Router } from "express";
import { prisma } from "./db.js";
import { authenticateToken } from "./middleware/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const [totalProducts, stockSummary, lowStockProducts] =
      await Promise.all([
        prisma.product.count({
          where: { organizationId },
        }),

        prisma.product.aggregate({
          where: { organizationId },
          _sum: { quantityOnHand: true },
        }),

        prisma.product.findMany({
          where: {
            organizationId,
            OR: [
              {
                lowStockThreshold: {
                  not: null,
                },
              },
            ],
          },
        }),
      ]);

    const settings = await prisma.settings.findUnique({
      where: { organizationId },
    });

    const defaultThreshold =
      settings?.defaultLowStockThreshold ?? 5;

    const lowStock = lowStockProducts.filter((product) => {
      const threshold =
        product.lowStockThreshold ?? defaultThreshold;

      return product.quantityOnHand <= threshold;
    });

    res.json({
      totalProducts,
      totalStockQuantity: stockSummary._sum.quantityOnHand ?? 0,
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
});

export default router;