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
      brandID: "6551072f1ca34ee7a8b87ad3",
    },
    {
      name: "Refrigerators",
      categoryID: "654fb3e6d659f47507cbb9d2",
      subCategoryID: "654fb9793926286ed1f4d312",
      brandID: "6551072e1ca34ee7a8b87ac9",
    },
    {
      name: "Microwaves",
      categoryID: "654fb3e6d659f47507cbb9d2",
      subCategoryID: "654fb9793926286ed1f4d312",
      brandID: "6551072f1ca34ee7a8b87adb",
    },
    {
      name: "Shampoos",
      categoryID: "654fb3e6d659f47507cbb9d5",
      subCategoryID: "6550f1f195df7ffa18b82c40",
      brandID: "65520ff23a3ca7469ebbf857",
    },
    {
      name: "Treadmills",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f2fee7b5d1160a83bc42",
      brandID: "65520fef3a3ca7469ebbf84d",
    },
    {
      name: "Yoga mats",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f2fee7b5d1160a83bc42",
      brandID: "6551072f1ca34ee7a8b87ad7",
    },
    {
      name: "Soccer ball",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f303e7b5d1160a83bc52",
      brandID: "6551072e1ca34ee7a8b87acf",
    },
    {
      name: "Tennis racket",
      categoryID: "654fb3e6d659f47507cbb9d7",
      subCategoryID: "6550f303e7b5d1160a83bc52",
      brandID: "6551072e1ca34ee7a8b87ad1",
    },
    {
      name: "Harrey potter series",
      categoryID: "654fb3e6d659f47507cbb9d9",
      subCategoryID: "6550f439bf9740cd22d7b750",
      brandID: "6551072e1ca34ee7a8b87acb",
    },
    {
      name: "Notebooks",
      categoryID: "654fb3e6d659f47507cbb9d9",
      subCategoryID: "6550f43cbf9740cd22d7b75f",
      brandID: "65520ff33a3ca7469ebbf85c",
    },
    {
      name: "Fish oils",
      categoryID: "654fb3e7d659f47507cbb9dd",
      subCategoryID: "6550f59a156b75ae67383edf",
      brandID: "6551072f1ca34ee7a8b87ad5",
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
      brandID: "6551072f1ca34ee7a8b87ad9",
    },
    {
      name: "Toshiba laptops",
      categoryID: "654fb3e2d659f47507cbb9c3",
      subCategoryID: "654fb7d7b5c5c6ea1ae337e3",
      brandID: "6551072e1ca34ee7a8b87ac9",
    },
  ];
  for (let i = 0; i < productArr.length; i++) {
    let product = {
      name: productArr[i].name,
      createdBy: "654d2b04d4429b90acb70b3c",
      slug: "",
      categoryID: productArr[i].categoryID,
      subCategoryID: productArr[i].subCategoryID,
      brandID: productArr[i].brandID,
    };
    product.slug = slugify(product.name, "_");

    const newproduct = new productModel(product);
    await newproduct.save();
  }
};

export const fakeProductItemsDataGenerator = async () => {
  let sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  for (let i = 1; i < 3; i++) {
    let product_item = {
      productID: "655211b7e83e8c48aada13bc",
      item_name: `adidas Mens Train Essentials 3-Stripes Training T-Shirt ${sizes[i]}`,
      description:
        "100% rec polyester - REGULAR-Crewneck - MADE IN PART W RECYCLED MATERIALS",
      item_slug: "",
      createdBy: "65206bde187c71d9a1a1a539",
      price: faker.commerce.price({ min: 20, max: 50000 }),
      discount: 0,
      paymentPrice: 0,
      stock: faker.number.int({ min: 10, max: 50 }),
      item_customID: nanoid(),
      color: "#5FA692",
      size: sizes[i],
      images: [
        {
          secure_url:
            "https://res.cloudinary.com/dvvmu40wx/image/upload/v1700161707/eCommerce/product_items/men%27s%20tshirt/1_jp0mq6.jpg",
          public_id: "",
        },
        {
          secure_url:
            "https://res.cloudinary.com/dvvmu40wx/image/upload/v1700161707/eCommerce/product_items/men%27s%20tshirt/2_dgmiw5.jpg",
          public_id: "",
        },
      ],
      mainImage: {
        secure_url:
          "https://res.cloudinary.com/dvvmu40wx/image/upload/v1700161707/eCommerce/product_items/men%27s%20tshirt/main_ifesvy.jpg",
        public_id: "",
      },
      // specifications: {
      //   ram: "6GB",
      //   processor: "Core i7",
      // }, // Custom specifications
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
