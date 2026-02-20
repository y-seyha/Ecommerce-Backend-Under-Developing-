import express from "express";
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import categoryRoutes from "./routes/category.route.js";
import { errorHandler } from "middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoutes);

//Middleware
app.use(errorHandler);

export default app;
