type BasePrimitive = string | number | boolean | null | undefined;

type Operator = '$gte' | '$lte' | '$gt' | '$lt' | '$in';

type OperatorValue = BasePrimitive | Array<string | number>;

type OperatorQuery = Partial<Record<Operator, OperatorValue>>;

const operatorMap: Record<string, Operator> = {
  gte: '$gte',
  lte: '$lte',
  gt: '$gt',
  lt: '$lt',
  in: '$in',
};

/**
 * Parse query params into MongoDB-safe filters with operator support.
 *
 * Example:
 *   { age_gte: '18', age_lte: '30', name: 'Alice' }
 * → { age: { $gte: 18, $lte: 30 }, name: 'Alice' }
 */
export const parseOperators = <T extends Record<string, BasePrimitive>>(
  query: T
): Record<string, OperatorQuery | BasePrimitive> => {
  const filters: Record<string, OperatorQuery | BasePrimitive> = {};

  for (const key in query) {
    const match = key.match(/^(\w+)_(gte|lte|gt|lt|in)$/);
    const rawValue = query[key];
    if (!rawValue && rawValue !== 0 && rawValue !== false) continue;

    if (match) {
      const [, field, op] = match;
      if (!field || !op) continue;

      const mongoOp = operatorMap[op];

      if (!mongoOp) continue;

      const value =
        op === 'in'
          ? String(rawValue)
              .split(',')
              .map((v) => (isNaN(Number(v)) ? v : Number(v)))
          : isNaN(Number(rawValue))
            ? rawValue
            : Number(rawValue);

      if (typeof filters[field] === 'object' && !Array.isArray(filters[field])) {
        (filters[field] as OperatorQuery)[mongoOp] = value;
      } else {
        filters[field] = { [mongoOp]: value };
      }
    } else {
      filters[key] = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
    }
  }

  return filters;
};
