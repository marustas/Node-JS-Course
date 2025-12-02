import type { Request, Response, NextFunction } from 'express';
import type { ParsedQs } from 'qs';
import xss from 'xss';

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
  if (obj == null) return obj;
  const entries = Object.entries(obj).map(([k, v]) => {
    return [k, sanitizeValue(v)];
  });

  return Object.fromEntries(entries) as T;
}

const sanitizeQuery = (query: ParsedQs): void => {
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      query[key] = sanitizeValue(query[key]) as ParsedQs[typeof key];
    }
  }
};

export function xssSanitizer(req: Request, _res: Response, next: NextFunction): void {
  req.body = sanitizeObject(req.body);
  sanitizeQuery(req.query);
  req.params = sanitizeObject(req.params);

  next();
}
