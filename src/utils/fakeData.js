import { faker } from "@faker-js/faker";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import categoryModel from "../../DB/models/categoryModel.js";
import subCategoryModel from "../../DB/models/subCategoryModel.js";
import brandsModel from "../../DB/models/brandsModel.js";
import productModel from "../../DB/models/productModel.js";
import userModel from "../../DB/models/userModel.js";
import tokenModel from "../../DB/models/tokenModel.js";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);

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
      categoryID: "6522a166729b40027df17247",
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
  for (let i = 0; i < 5; i++) {
    let product = {
      name: "Pro_" + faker.commerce.productName(),
      createdBy: "65206bde187c71d9a1a1a539",
      slug: "",
      categoryID: "",
      subCategoryID: "",
      brandID: "",
    };
    product.slug = slugify(product.name, "_");

    const newproduct = new productModel(product);
    await newproduct.save();
  }
};

export const fakeProductItemsDataGenerator = async () => {
  for (let i = 0; i < 3; i++) {
    let product_item = {
      productID: "",
      item_name: "Pro_item_" + faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      item_slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      price: faker.commerce.price({ min: 20, max: 50000 }),
      discount: faker.number.int({ min: 0, max: 100 }),
      paymentPrice: 0,
      stock: faker.number.int({ min: 10, max: 50 }),
      customID: nanoid(),
      colors: faker.color.human(),
      size: "L",
      specifications: {}, // Custom specifications
    };
    product_item.item_slug = slugify(product_item.name, "_");
    product_item.paymentPrice =
      product_item.price * (1 - product_item.discount / 100);

    const newproduct_item = new product_itemModel(product_item);
    await newproduct_item.save();
  }
};

//===================================================================
//====================== Users ======================================
//===================================================================

export const fakeUsersDataGenerator = async () => {
  for (let i = 0; i < 10; i++) {
    let user = {
      userName: faker.person.fullName().split(" ").join(""),
      email: faker.internet.email(),
      password: "Aaaa@123",
      role: "user",
      customID: nanoid(),
      phoneNumber: faker.phone.number(),
      gender: faker.person.sex(),
      isConfirmed: true,
    };
    const newUser = new userModel(user);
    const savedUser = await newUser.save();
    let userToken = {
      user_id: savedUser._id,
    };
    const newUserToken = new tokenModel(userToken);
    await newUserToken.save();
  }
};
