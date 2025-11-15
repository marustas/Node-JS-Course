import { Query } from 'mongoose';
import type { Tour } from '../../models/tourModel.ts';
import { parseOperators } from '../../utils/parseQueryOperator.ts';

type TourFilters = Required<
  Omit<Tour, 'summary' | 'description' | 'imageCover' | 'images' | 'startDates' | 'createdAt'>
>;

type Direction = 'asc' | 'desc';

export interface TourQueryFeatures extends TourFilters {
  page?: number;
  limit?: number;
  sortBy: `${keyof TourFilters}:${Direction}`;
}

type TourQueryType = Query<Tour[], Tour>;

class TourQuery {
  private query: TourQueryType;
  private queryString: TourQueryFeatures;

  constructor(query: TourQueryType, queryString: TourQueryFeatures) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { ...filters } = this.queryString;
    const parsedFilters = parseOperators<TourFilters>(filters);

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

export default TourQuery;
