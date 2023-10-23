import productModel from "../../DB/models/productModel.js";
import product_itemModel from "../../DB/models/product_itemModel.js";
import subCategoryModel from "../../DB/models/subCategoryModel.js";
import cloudinary from "../utils/cloudinary.js";

//================================================================================================
//======================   SubCategories  ========================================================
//================================================================================================

export function deleteProductsForSubCategories(schema) {
  schema.pre("findOneAndDelete", async function () {
    try {
      const checkProductsExistence = await productModel
        .find({
          subCategoryID: this.getQuery()._id,
        })
        .populate("productItems");
      if (checkProductsExistence.length) {
        // Delete related images
        for (let i = 0; i < checkProductsExistence.length; i++) {
          for (
            let j = 0;
            j < checkProductsExistence[i].productItems.length;
            j++
          ) {
            if (
              checkProductsExistence[i].productItems[j]?.images?.length ||
              checkProductsExistence[i].productItems[j]?.mainImage?.public_id
            ) {
              await cloudinary.api.delete_resources_by_prefix(
                `${process.env.cloud_folder}/Products/${checkProductsExistence[i].customID}`
              );
              await cloudinary.api.delete_folder(
                `${process.env.cloud_folder}/Products/${checkProductsExistence[i].customID}`
              );
            }
          }
        }
        const deletedRelatedProducts = await productModel.deleteMany({
          subCategoryID: this.getQuery()._id,
        });
        const deleteRelatedProductItems = await product_itemModel.deleteMany({
          productID: {
            $in: checkProductsExistence.map((product) => product._id),
          },
        });
        if (!deleteRelatedProductItems.deletedCount) {
          throw new Error("Failed to delete related product items!");
        }
        if (!deletedRelatedProducts.deletedCount) {
          throw new Error("Failed to delete related products!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

//================================================================================================
//========================  Categories   =========================================================
//================================================================================================

export function deleteProductsForCategories(schema) {
  schema.pre("findOneAndDelete", async function () {
    try {
      const checkProductsExistence = await productModel
        .find({
          categoryID: this.getQuery()._id,
        })
        .populate("productItems");
      if (checkProductsExistence.length) {
        // Delete related images
        for (let i = 0; i < checkProductsExistence.length; i++) {
          for (
            let j = 0;
            j < checkProductsExistence[i].productItems.length;
            j++
          ) {
            if (
              checkProductsExistence[i].productItems[j]?.images?.length ||
              checkProductsExistence[i].productItems[j]?.mainImage?.public_id
            ) {
              await cloudinary.api.delete_resources_by_prefix(
                `${process.env.cloud_folder}/Products/${checkProductsExistence[i].customID}`
              );
              await cloudinary.api.delete_folder(
                `${process.env.cloud_folder}/Products/${checkProductsExistence[i].customID}`
              );
            }
          }
        }
        const deletedRelatedProducts = await productModel.deleteMany({
          categoryID: this.getQuery()._id,
        });
        const deleteRelatedProductItems = await product_itemModel.deleteMany({
          productID: {
            $in: checkProductsExistence.map((product) => product._id),
          },
        });
        if (!deleteRelatedProductItems.deletedCount) {
          throw new Error("Failed to delete related product items!");
        }
        if (!deletedRelatedProducts.deletedCount) {
          throw new Error("Failed to delete related products!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

//================================================================
//================================================================

export function deleteSubCategoriesForCategories(schema) {
  schema.pre("findOneAndDelete", async function () {
    try {
      const checkSubCategoriesExistence = await subCategoryModel.find({
        categoryID: this.getQuery()._id,
      });
      if (checkSubCategoriesExistence.length) {
        //Delete related images of subcategories :
        for (let i = 0; i < checkSubCategoriesExistence.length; i++) {
          if (checkSubCategoriesExistence[i].image?.public_id) {
            await cloudinary.api.delete_resources_by_prefix(
              `${process.env.cloud_folder}/SubCategories/${checkSubCategoriesExistence[i].customID}`
            );
            await cloudinary.api.delete_folder(
              `${process.env.cloud_folder}/SubCategories/${checkSubCategoriesExistence[i].customID}`
            );
          }
        }

        const deletedSubCategories = await subCategoryModel.deleteMany({
          categoryID: this.getQuery()._id,
        });
        if (!deletedSubCategories.deletedCount) {
          throw new Error("Failed to delete subCategories !", { cause: 500 });
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

//==============================================================================================
//========================   Brands   ==========================================================
//==============================================================================================

export function deleteProdoctsForBrands(schema) {
  schema.pre("findOneAndDelete", async function () {
    try {
      const checkProductsExistence = await productModel
        .find({
          brandID: this.getQuery()._id,
        })
        .populate("productItems");
      if (checkProductsExistence.length) {
        // Delete related images
        for (let i = 0; i < checkProductsExistence.length; i++) {
          for (
            let j = 0;
            j < checkProductsExistence[i].productItems.length;
            j++
          ) {
            if (
              checkProductsExistence[i].productItems[j]?.images?.length ||
              checkProductsExistence[i].productItems[j]?.mainImage?.public_id
            ) {
              await cloudinary.api.delete_resources_by_prefix(
                `${process.env.cloud_folder}/Products/${checkProductsExistence[i].customID}`
              );
              await cloudinary.api.delete_folder(
                `${process.env.cloud_folder}/Products/${checkProductsExistence[i].customID}`
              );
            }
          }
        }
        const deletedRelatedProducts = await productModel.deleteMany({
          brandID: this.getQuery()._id,
        });
        const deleteRelatedProductItems = await product_itemModel.deleteMany({
          productID: {
            $in: checkProductsExistence.map((product) => product._id),
          },
        });
        if (!deleteRelatedProductItems.deletedCount) {
          throw new Error("Failed to delete related product items!");
        }
        if (!deletedRelatedProducts.deletedCount) {
          throw new Error("Failed to delete related products!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}
