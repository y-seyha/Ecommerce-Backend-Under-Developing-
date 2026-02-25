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
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// Add version prefix v1 will implement in the future (Microservice)
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/carts", cartRoutes);
app.use("/api/v1/cart-items", cartItemRoutes);
app.use("/api/v1/orders", ordersRoute);
app.use("/api/v1/order-items", orderItemRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);

//cors setup
app.use(
  cors({
    origin: ["https://my-frontend.com", "https://another-site.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies/auth headers
    maxAge: 600, // cache preflight requests for 10 minutes
  }),
);

//helmet setup
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted-scripts.com"],
        imgSrc: ["'self'", "data:"],
      },
    },
    frameguard: { action: "deny" }, // prevent clickjacking
    hidePoweredBy: true, // hides Express
  }),
);

//Middleware
app.use(errorHandler);

export default app;
