import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Logger } from "utils/logger.js";
import { Request, Response, NextFunction } from "express";

const logger = Logger.getInstance();

export const corsMiddleware = cors({
  origin: ["https://my-frontend.com", "https://another-site.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-scripts.com"],
      imgSrc: ["'self'", "data:"],
    },
  },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
});

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1minutes
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log full error stack in dev
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
  });
};
