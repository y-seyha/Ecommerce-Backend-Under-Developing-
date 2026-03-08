import { Request, Response, NextFunction } from "express";
import { OrderService } from "../service/orders.service.js";
import { OrderItemService } from "../service/orderItem.service.js";
import { Logger } from "utils/logger.js";
import { Database } from "Configuration/database.js";
import { IUser } from "model/user.model.js";

export type AuthenticatedUser = IUser & { id: number };

export class CheckoutController {
  private orderService = new OrderService();
  private orderItemService = new OrderItemService();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // 1Get user's cart
      const { rows: cartRows } = await this.pool.query(
        "SELECT id FROM carts WHERE user_id=$1",
        [userId],
      );
      if (!cartRows.length)
        return res.status(400).json({ message: "Cart not found" });
      const cartId = cartRows[0].id;

      //  Get cart items
      const { rows: cartItems } = await this.pool.query(
        `SELECT ci.product_id, ci.quantity, p.price, ci.id AS cart_item_id
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id=$1`,
        [cartId],
      );

      if (!cartItems.length)
        return res.status(400).json({ message: "Cart is empty" });

      //  Calculate total & validate stock
      let total = 0;
      for (const item of cartItems) {
        if (item.quantity > item.stock) {
          return res.status(400).json({
            message: `Not enough stock for product ${item.product_id}`,
          });
        }
        total += Number(item.price) * item.quantity;
      }

      //  Create order
      const { rows: orderRows } = await this.pool.query(
        "INSERT INTO orders(user_id, total_price) VALUES($1, $2) RETURNING *",
        [userId, total],
      );
      const order = orderRows[0];

      //  Insert order items & update stock
      for (const item of cartItems) {
        await this.orderItemService.createOrderItem({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: Number(item.price),
        });

        await this.pool.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2",
          [item.quantity, item.product_id],
        );
      }

      // Clear cart items
      await this.pool.query("DELETE FROM cart_items WHERE cart_id=$1", [
        cartId,
      ]);

      return res.json({
        message: "Checkout successful",
        order: {
          ...order,
          items: cartItems,
        },
        total,
        itemsPurchased: cartItems.length,
      });
    } catch (error) {
      this.logger.error("Checkout failed", error);
      next(error);
    }
  };
}
