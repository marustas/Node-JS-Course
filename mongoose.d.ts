import 'mongoose';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'mongoose' {
  interface Query<ResultType, DocType, THelpers = {}> {
    _reviewDoc?: DocType;
  }
}
