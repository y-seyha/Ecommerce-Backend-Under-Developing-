import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape, ZodError, ZodIssue } from "zod";
import { Logger } from "utils/logger.js";

const logger = Logger.getInstance();

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and get typed result
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query, // only for validation
      });

      // Overwrite request with validated data (body and params only)
      req.body = parsed.body as Request["body"];
      req.params = parsed.params as Request["params"];
      // req.query stays readonly

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues: ZodIssue[] = error.issues;
        logger.error("Validation failed", issues);

        return res.status(400).json({
          message: "Validation Error",
          errors: issues,
        });
      }

      next(error);
    }
  };
