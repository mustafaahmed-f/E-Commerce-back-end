import mongoose from "mongoose";
import { paginationFunction } from "./pagination.js";

export class ApiFeatures {
  constructor(mongooseQuery, queryObj) {
    this.mongooseQuery = mongooseQuery;
    this.queryObj = queryObj;
    this.query = {};
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
    const {
      page,
      size,
      sort,
      select,
      search,
      colors,
      sizes,
      rams,
      memorySizes,
      ...filter
    } = this.queryObj;

    const finalFilterQuery = JSON.parse(
      JSON.stringify(filter).replace(
        /eq|ne|regex|options|gt|gte|lt|lte|in|nin/g,
        (match) => {
          return `$${match}`;
        }
      )
    );
    this.query = { ...this.query, ...finalFilterQuery };

    //// Check If there is filtration for colors or sizes

    if (colors && Array.isArray(colors) && colors.length > 0) {
      this.query = { ...this.query, "colorsAndSizes.color": { $in: colors } };
    }

    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      this.query = { ...this.query, "colorsAndSizes.size": { $in: sizes } };
    }

    this.mongooseQuery.find(this.query);
    return this;
  }
}
