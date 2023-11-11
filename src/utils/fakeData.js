import { faker } from "@faker-js/faker";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import categoryModel from "../../DB/models/categoryModel.js";
import subCategoryModel from "../../DB/models/subCategoryModel.js";
import brandsModel from "../../DB/models/brandsModel.js";
import productModel from "../../DB/models/productModel.js";
import userModel from "../../DB/models/userModel.js";
import tokenModel from "../../DB/models/tokenModel.js";
import product_itemModel from "../../DB/models/product_itemModel.js";
const nanoid = customAlphabet("12345678!_=abcdefghm*", 10);
import cloudinary from "../../src/utils/cloudinary.js";

//===================================================================
//======================== Categories ===============================
//===================================================================

export const fakeCategoriesDataGenerator = async () => {
  const categoriesNames = [
    {
      name: "Electronics",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699719473/eCommerce/categories_images/electronics_bpy6yf.jpg",
      public_id: "",
    },
    {
      name: "Clothing",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699719577/eCommerce/categories_images/clothes_category_jk0kjm.jpg",
      public_id: "",
    },
    {
      name: "Home and kitchen",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699719627/eCommerce/categories_images/home_and_kitchen_category_xt8c71.jpg",
      public_id: "",
    },
    {
      name: "Beauty and Personal Care",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699719702/eCommerce/categories_images/Beauty_and_Personal_Care_category_xrlkl5.jpg",
      public_id: "",
    },
    {
      name: "Sports and Outdoors",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699719817/eCommerce/categories_images/sports_and_outdoors_category_lzelt0.jpg",
      public_id: "",
    },
    {
      name: "Books and Stationery",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699719911/eCommerce/categories_images/books_and_stationary_category_mk7nik.jpg",
      public_id: "",
    },
    {
      name: "Toys and Games",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699720019/eCommerce/categories_images/Toys_and_games_category_j583gb.jpg",
      public_id: "",
    },
    {
      name: "Health & Wellness",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699720088/eCommerce/categories_images/health_and_wellness_category_lgauqm.jpg",
      public_id: "",
    },
    {
      name: "Jewellery",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699720168/eCommerce/categories_images/jewellery_category_ilsd51.jpg",
      public_id: "",
    },
  ];
  for (let i = 0; i < categoriesNames.length; i++) {
    let category = {
      name: categoriesNames[i].name,
      slug: "",
      createdBy: "654d2b04d4429b90acb70b3c",
      customID: nanoid(),
      image: {
        secure_url: categoriesNames[i].secure_url,
        public_id: "",
      },
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
  const subCategoriesData = [
    {
      name: "Furniture & Decor",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699723510/eCommerce/sub_categories_images/Furniture_Decor_sub_category_eqhraz.jpg",
    },
    {
      name: "Appliances",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699723515/eCommerce/sub_categories_images/Appliances_sub_category_omw23q.jpg",
    },
    {
      name: "Kitchenware",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699723605/eCommerce/sub_categories_images/Kitchenware_sub_category_f0udzu.jpg",
    },
  ];
  for (let i = 0; i < subCategoriesData.length; i++) {
    let subCategory = {
      name: subCategoriesData[i].name,
      slug: "",
      createdBy: "654d2b04d4429b90acb70b3c",
      customID: nanoid(),
      categoryID: "654fb3e6d659f47507cbb9d2",
      image: {
        secure_url: subCategoriesData[i].secure_url,
        public_id: "",
      },
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
      categoryID: "6522a166729b40027df17247",
      subCategoryID: "652f739c75149d5c2255d8d0",
      brandID: "6522c3dc61ac11c0cc18d6ad",
    };
    product.slug = slugify(product.name, "_");

    const newproduct = new productModel(product);
    await newproduct.save();
  }
};

export const fakeProductItemsDataGenerator = async () => {
  let sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  for (let i = 0; i < 3; i++) {
    let product_item = {
      productID: "653825e9049f28b552750ae9",
      item_name: "Pro_item_" + faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      item_slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      price: faker.commerce.price({ min: 20, max: 50000 }),
      discount: faker.number.int({ min: 0, max: 100 }),
      paymentPrice: 0,
      stock: faker.number.int({ min: 10, max: 50 }),
      item_customID: nanoid(),
      color: faker.color.human(),
      size: sizes[Math.floor(Math.random() * sizes.length)],
      specifications: {
        ram: "6GB",
        processor: "Core i7",
      }, // Custom specifications
    };
    product_item.item_slug = slugify(product_item.item_name, "_");
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
