import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validateBody = <T>(schema: ZodSchema<T>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    return next(error);
  }
};
