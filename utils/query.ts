import type { Query } from 'mongoose';
import { parseOperators } from './parseQueryOperator.ts';

type Direction = 'asc' | 'desc';

export interface QueryFeatures {
  page?: number;
  limit?: number;
  sortBy: `${string}:${Direction}`;
}

class RequestQuery<TModel> {
  private query: Query<TModel[], TModel>;
  private queryString: QueryFeatures;

  constructor(query: Query<TModel[], TModel>, queryString: QueryFeatures) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { ...filters } = this.queryString;
    const parsedFilters = parseOperators(filters);

    this.query = this.query.find(parsedFilters);

    return this;
  }

  paginate() {
    if (this.queryString.page) {
      const skip = (this.queryString.page - 1) * (this.queryString.limit || 10);
      this.query = this.query.skip(skip).limit(this.queryString.limit || 10);
    }

    return this;
  }

  sort() {
    if (this.queryString.sortBy) {
      const [sortField, direction] = this.queryString.sortBy.split(':');
      const sortDirection = direction === 'desc' ? -1 : 1;

      if (sortField) {
        this.query = this.query.sort({ [sortField]: sortDirection, _id: 1 });
      }
    }

    return this;
  }

  getQuery() {
    return this.query;
  }
}

export default RequestQuery;
