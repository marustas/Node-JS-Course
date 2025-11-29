import type { RequestHandler } from 'express';

export const sanitizeMongo: RequestHandler = (req, _res, next) => {
  const sanitize = (obj: Record<string, unknown>) => {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key] as Record<string, unknown>);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};
