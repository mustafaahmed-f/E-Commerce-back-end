import { paginationFunction } from "./pagination.js";

export class ApiFeatures {
  constructor(mongooseQuery, queryObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryObj = queryObj;
  }

  //pagination
  paignation() {
    const { limit, skip } = paginationFunction({
      page: this.queryObj.page,
      size: this.queryObj.size,
    });
    this.mongooseQuery.limit(limit).skip(skip);
    return this;
  }

  //sort
  sort() {
    const { sort } = this.queryObj;
    this.mongooseQuery.sort(sort.replaceAll("/", " "));
    return this;
  }

  //select
  select() {
    const { select } = this.queryObj;
    this.mongooseQuery.select(select.replaceAll("/", " "));
    return this;
  }

  //filter
  filter() {
    const neededQueries = ["sort", "page", "size", "select"];
    const allQuery = { ...req.query };
    neededQueries.forEach((key) => delete allQuery[key]);
    const finalFilterQuery = JSON.parse(
      JSON.stringify(allQuery).replace(
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
