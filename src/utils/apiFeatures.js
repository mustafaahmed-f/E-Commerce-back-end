import { paginationFunction } from "./pagination.js";

export class ApiFeatures {
  constructor(mongooseQuery, queryObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryObj = queryObj;
  }

  //pagination
  paignation() {
    const { page, size } = this.queryObj;
    const { limit, skip } = paginationFunction({ page, size });
    this.mongooseQuery.limit(limit).skip(skip);
    return this;
  }

  //sort
  sort() {
    this.mongooseQuery.sort(this.queryObj.sort?.replaceAll("/", " "));
    return this;
  }

  //select
  select() {
    this.mongooseQuery.select(this.queryObj.select?.replaceAll("/", " "));
    return this;
  }

  //filter
  filter() {
    const { page, size, sort, select, search, ...filter } = this.queryObj;

    const finalFilterQuery = JSON.parse(
      JSON.stringify(filter).replace(
        /eq|ne|regex|options|gt|gte|lt|lte|in|nin/g,
        (match) => {
          return `$${match}`;
        }
      )
    );
    this.mongooseQuery.find(finalFilterQuery);
    return this;
  }
}
