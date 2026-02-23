import express from "express";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import categoryRoutes from "./routes/category.route.js";
import cartRoutes from "./routes/cart.route.js";
import cartItemRoutes from "./routes/cartItem.route.js";
import ordersRoute from "./routes/orders.route.js";
import orderItemRoutes from "./routes/orderItem.route.js";
import paymentRoutes from "./routes/payment.route.js";
import reviewRoutes from "./routes/review.route.js";
import { errorHandler } from "middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

//Middleware
app.use(errorHandler);

export default app;
