import { faker } from "@faker-js/faker";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import categoryModel from "../../DB/models/categoryModel.js";
import subCategoryModel from "../../DB/models/subCategoryModel.js";
import brandsModel from "../../DB/models/brandsModel.js";
import productModel from "../../DB/models/productModel.js";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);

//===================================================================
//======================== Products =================================
//===================================================================
export const fakeProuctDataGenerator = () => {
  for (let i = 0; i < 10; i++) {
    const product = {
      name: faker.commerce.productName(),
      material: faker.commerce.productMaterial(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
      image: faker.image.url(),
    };
  }
  console.log(product);
};

//===================================================================
//======================== Categories ===============================
//===================================================================

export const fakeCategoriesDataGenerator = async () => {
  for (let i = 0; i < 10; i++) {
    let category = {
      name: faker.string.alpha({ length: 10 }),
      slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      customID: nanoid(),
    };
    category.slug = slugify(category.name, "_");

    const newCategory = new categoryModel(category);
    await newCategory.save();
  }
};

//===================================================================
//====================== subCategories ==============================
//===================================================================

export const fakeSubCategoriesDataGenerator = async () => {
  for (let i = 0; i < 10; i++) {
    let subCategory = {
      name: "sub" + faker.string.alpha({ length: 10 }),
      slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      customID: nanoid(),
      categoryID: "6522a166729b40027df17245",
    };
    subCategory.slug = slugify(subCategory.name, "_");

    const newSubCategory = new subCategoryModel(subCategory);
    await newSubCategory.save();
  }
};

//===================================================================
//====================== Brands ==============================
//===================================================================

export const fakeBrandsDataGenerator = async () => {
  for (let i = 0; i < 10; i++) {
    let brand = {
      name: "bran" + faker.string.alpha({ length: 10 }),
      slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      customID: nanoid(),
    };
    brand.slug = slugify(brand.name, "_");

    const newBrand = new brandsModel(brand);
    await newBrand.save();
  }
};

//===================================================================
//====================== Products ==============================
//===================================================================

export const fakeProductsDataGenerator = async () => {
  for (let i = 0; i < 10; i++) {
    let product = {
      name: "Pro_" + faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      price: faker.commerce.price({ min: 20, max: 50000 }),
      discount: faker.number.int({ min: 0, max: 100 }),
      paymentPrice: 0,
      stock: faker.number.int({ min: 10, max: 50 }),
      customID: nanoid(),
      colors: [faker.color.human(), faker.color.human(), faker.color.human()],
      categoryID: "6522a166729b40027df17245",
      subCategoryID: "6522fa0c4cfeccc92ab107a2",
      brandID: "6522c3dc61ac11c0cc18d69b",
    };
    product.slug = slugify(product.name, "_");
    product.paymentPrice = product.price * (1 - product.discount / 100);

    const newProduct = new productModel(product);
    await newProduct.save();
  }
};
