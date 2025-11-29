import type { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// JSON-safe value types
type Primitive = string | number | boolean | null | undefined;
type Json = Primitive | Json[] | { [key: string]: Json };

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return sanitizeArray(value);
  }

  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
}

function sanitizeArray(input: readonly unknown[]): Json[] {
  return input.map((v) => sanitizeValue(v) as Json);
}

function sanitizeObject<T extends object>(obj: T): T {
  const entries = Object.entries(obj).map(([k, v]) => {
    return [k, sanitizeValue(v)];
  });

  return Object.fromEntries(entries) as T;
}

export function xssSanitizer(req: Request, _res: Response, next: NextFunction): void {
  req.body = sanitizeObject(req.body);

  req.query = sanitizeObject(req.query);

  req.params = sanitizeObject(req.params);

  next();
}
