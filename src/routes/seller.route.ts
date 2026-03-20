import { Router } from "express";
import { SellerController } from "../controller/seller.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const router = Router();
const controller = new SellerController();

// Seller orders
router.get("/orders", authMiddleware, authorizeRole("seller"), controller.getOrders);
router.patch("/orders/status", authMiddleware, authorizeRole("seller"), controller.updateOrderItemStatus);

// Seller analytics
router.get("/analytics", authMiddleware, authorizeRole("seller"), controller.getAnalytics);

router.get(
  "/me",
  authMiddleware,
  authorizeRole("seller"),
  controller.getMyStore,
);

router.put(
  "/me",
  authMiddleware,
  authorizeRole("seller"),
  controller.updateMyStore,
);

router.get("/:id", authMiddleware, controller.getSellerById);

router.put("/become", authMiddleware, controller.becomeSeller);

router.get(
  "/:id/products",
  authMiddleware,
  authorizeRole("seller", "admin", "customer"),
  controller.getProductsBySellerId,
);




export default router;
