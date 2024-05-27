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
      name: "Nodric track",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699876683/eCommerce/brands_images/nodric_track_logo_hubhf4.jpg",
      },
    },
    {
      name: "MATRIX",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699876683/eCommerce/brands_images/MATRIX_logo_rm8cns.png",
      },
    },
    {
      name: "MIDORI",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699876683/eCommerce/brands_images/midori_p4syq5.jpg",
      },
    },
    {
      name: "Inkey list TM",
      logo: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1699876683/eCommerce/brands_images/Inkey_list_b5210q.jpg",
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
  let sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  let colors = ["red", "green", "blue", "yellow", "black", "white"];
  let IDs = [
    {
      categoryID: "654fb3e5d659f47507cbb9cd",
      subCategoryID: "654fb84f1997bb3fd8436aea",
      brandID: "6551072e1ca34ee7a8b87acf",
    },
    {
      categoryID: "654fb3e2d659f47507cbb9c3",
      subCategoryID: "654fb7d7b5c5c6ea1ae337e3",
      brandID: "6551072d1ca34ee7a8b87abf",
    },
  ];
  for (let i = 1; i < 20; i++) {
    let product = {
      productID: "654d2b04d4429b90acb70b3c",
      name: `new2 ${faker.lorem.lines(1)}`,
      description:
        "100% rec polyester - REGULAR-Crewneck - MADE IN PART W RECYCLED MATERIALS",
      slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      price: faker.commerce.price({ min: 20, max: 50000 }),
      discount: 0,
      stock: 0,
      overAllStock: false,
      paymentPrice: 0,
      // stock: faker.number.int({ min: 10, max: 50 }),
      stock: 0,
      soldItems: 0,
      customID: nanoid(),
      colorsAndSizes: [
        {
          color: colors[Math.floor(Math.random() * 5)],
          size: sizes[Math.floor(Math.random() * 5)],
          stock: faker.number.int({ min: 10, max: 50 }),
          soldItems: 0,
        },
      ],
      categoryID: IDs[0].categoryID,
      subCategoryID: IDs[0].subCategoryID,
      brandID: IDs[0].brandID,

      rate: Math.floor(Math.random() * 6),
      // images: [
      //   {
      //     secure_url:
      //       "https://res.cloudinary.com/dvvmu40wx/image/upload/v1700161707/eCommerce/product_items/men%27s%20tshirt/1_jp0mq6.jpg",
      //     public_id: "",
      //   },
      //   {
      //     secure_url:
      //       "https://res.cloudinary.com/dvvmu40wx/image/upload/v1700161707/eCommerce/product_items/men%27s%20tshirt/2_dgmiw5.jpg",
      //     public_id: "",
      //   },
      // ],
      // mainImage: {
      //   secure_url:
      //     "https://res.cloudinary.com/dvvmu40wx/image/upload/v1700161707/eCommerce/product_items/men%27s%20tshirt/main_ifesvy.jpg",
      //   public_id: "",
      // },
      // specifications: {
      //   ram: "6GB",
      //   processor: "Core i7",
      // }, // Custom specifications
    };
    product.slug = slugify(product.name, "_");
    product.paymentPrice = product.price * (1 - product.discount / 100);

    try {
      const newProduct = new productModel(product);
      await newProduct.save();
    } catch (error) {
      console.log(error);
    }
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
