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
      name: "Vitamins & Supplements",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699804285/eCommerce/sub_categories_images/Vitamins_Supplements_sub_category_vizqo6.jpg",
    },
    {
      name: "Fitness Accessories",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699804394/eCommerce/sub_categories_images/Fitness_Accessories_sub_category_zqtlcb.jpg",
    },
    {
      name: "Personal Care Products",
      secure_url:
        "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699804465/eCommerce/sub_categories_images/Personal_Care_Products_sub_category_asgynq.jpg",
    },
  ];
  for (let i = 0; i < subCategoriesData.length; i++) {
    let subCategory = {
      name: subCategoriesData[i].name,
      slug: "",
      createdBy: "654d2b04d4429b90acb70b3c",
      customID: nanoid(),
      categoryID: "654fb3e7d659f47507cbb9dd",
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
  const brandsData = [
    {
      name: "Apple",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808671/eCommerce/brands_images/apple_m00ad4.jpg",
        public_id: "",
      },
    },
    {
      name: "Samsung",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808662/eCommerce/brands_images/Samsung_w8zupr.jpg",
        public_id: "",
      },
    },
    {
      name: "sony",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808663/eCommerce/brands_images/sony_y7hf98.png",
        public_id: "",
      },
    },
    {
      name: "canon",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808676/eCommerce/brands_images/canon_x8ltzi.jpg",
        public_id: "",
      },
    },
    {
      name: "Toshiba",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808677/eCommerce/brands_images/toshiba_dorrzp.jpg",
        public_id: "",
      },
    },
    {
      name: "penguin books",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808665/eCommerce/brands_images/Penguin_logo.svg_f7upey.png",
        public_id: "",
      },
    },
    {
      name: "nike",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808695/eCommerce/brands_images/nike_brand_kssjpe.jpg",
        public_id: "",
      },
    },
    {
      name: "adidas",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808689/eCommerce/brands_images/adidas_b6kwpd.jpg",
        public_id: "",
      },
    },
    {
      name: "wilson",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808666/eCommerce/brands_images/wilson_jmrbit.png",
        public_id: "",
      },
    },
    {
      name: "zara",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808667/eCommerce/brands_images/zara_anonyh.jpg",
        public_id: "",
      },
    },
    {
      name: "Nodric naturals",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808692/eCommerce/brands_images/nodric_naturals_gczujf.jpg",
        public_id: "",
      },
    },
    {
      name: "Jade yoga",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808673/eCommerce/brands_images/Jode_yoga_bcjd3h.png",
        public_id: "",
      },
    },
    {
      name: "Signal",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808670/eCommerce/brands_images/Signal_dxoo3k.png",
        public_id: "",
      },
    },
    {
      name: "Panasonic",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699808677/eCommerce/brands_images/Panasonic_hik1oj.png",
        public_id: "",
      },
    },
  ];
  for (let i = 0; i < brandsData.length; i++) {
    let brand = {
      name: brandsData[i].name,
      slug: "",
      createdBy: "654d2b04d4429b90acb70b3c",
      customID: nanoid(),
      logo: {
        secure_url: brandsData[i].logo.secure_url,
        public_id: brandsData[i].logo.public_id,
      },
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
  const productArr = [
    {
      name: "iPhone 12",
      categoryID: "654fb3e2d659f47507cbb9c3",
      subCategoryID: "654fb7d3b5c5c6ea1ae337d9",
      brandID: "6551072a1ca34ee7a8b87ab5",
    },
    {
      name: "Canon EOS R5",
      categoryID: "654fb3e2d659f47507cbb9c3",
      subCategoryID: "654fb7d7b5c5c6ea1ae337e8",
      brandID: "6551072e1ca34ee7a8b87ac7",
    },
    {
      name: "Men's T-Shirts",
      categoryID: "654fb3e5d659f47507cbb9cd",
      subCategoryID: "654fb84f1997bb3fd8436aea",
      brandID: "6551072e1ca34ee7a8b87acd",
    },
    {
      name: "Women's dresses",
      categoryID: "654fb3e5d659f47507cbb9cd",
      subCategoryID: "654fb8521997bb3fd8436af4",
      brandID,
    },
    {
      name: "Refrigerators",
      categoryID: "654fb3e6d659f47507cbb9d2",
      subCategoryID: "654fb9793926286ed1f4d312",
      brandID,
    },
    {
      name: "Microwaves",
      categoryID: "654fb3e6d659f47507cbb9d2",
      subCategoryID: "654fb9793926286ed1f4d312",
      brandID,
    },
    {
      name: "Face masks",
      categoryID: "654fb3e6d659f47507cbb9d5",
      subCategoryID: "6550f1ee95df7ffa18b82c35",
      brandID,
    },
    {
      name: "Shampoos",
      categoryID: "654fb3e6d659f47507cbb9d5",
      subCategoryID: "6550f1f195df7ffa18b82c40",
      brandID,
    },
    {
      name: "Treadmills",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f2fee7b5d1160a83bc42",
      brandID,
    },
    {
      name: "Yoga mats",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f2fee7b5d1160a83bc42",
      brandID,
    },
    {
      name: "Soccer ball",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f303e7b5d1160a83bc52",
      brandID,
    },
    {
      name: "Tennis racket",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f303e7b5d1160a83bc52",
      brandID,
    },
    {
      name: "Harrey potter series",
      categoryID: "654fb3e6d659f47507cbb9d9",
      subCategoryID: "6550f439bf9740cd22d7b750",
      brandID,
    },
    {
      name: "Notebooks",
      categoryID: "654fb3e6d659f47507cbb9d9",
      subCategoryID: "6550f43cbf9740cd22d7b75f",
      brandID,
    },
    {
      name: "Fish oils",
      categoryID: "654fb3e7d659f47507cbb9dd",
      subCategoryID: "6550f59a156b75ae67383edf",
      brandID,
    },
    {
      name: "Foam rollers",
      categoryID: "654fb3e7d659f47507cbb9dd",
      subCategoryID: "6550f59d156b75ae67383eea",
      brandID: "6551072e1ca34ee7a8b87acf",
    },
    {
      name: "Toothpaste",
      categoryID: "654fb3e7d659f47507cbb9dd",
      subCategoryID: "6550f59f156b75ae67383eef",
      brandID,
    },
    {
      name: "Dell laptops",
      categoryID: "654fb3e2d659f47507cbb9c3",
      subCategoryID: "654fb7d7b5c5c6ea1ae337e3",
      brandID: "",
    },
  ];
  for (let i = 0; i < 5; i++) {
    let product = {
      name: "Pro_" + faker.commerce.productName(),
      createdBy: "654d2b04d4429b90acb70b3c",
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
