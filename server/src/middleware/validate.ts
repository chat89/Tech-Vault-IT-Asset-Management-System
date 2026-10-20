/**
 * middleware/validate.ts
 * Generic Zod request-body validation middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({ success: false, message: 'Validation failed', errors });
      return;
    }
    req.body = result.data; // Replace with parsed (trimmed/transformed) data
    next();
  };

