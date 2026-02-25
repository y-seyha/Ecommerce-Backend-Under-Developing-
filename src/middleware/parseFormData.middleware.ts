import { Request, Response, NextFunction } from "express";

// Middleware to fix req.body for multipart/form-data
export const parseFormData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.is("multipart/form-data") && req.body) {
    // Convert number fields from strings to numbers
    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.stock) req.body.stock = Number(req.body.stock);
  }
  next();
};
