import product_itemModel from "../../DB/models/product_itemModel.js";

export const deleteItemsWhenDeleteProduct = (schema) => {
  schema.post("findByIdAndDelete", async function (params) {
    const productItems = await product_itemModel.find({
      productID: this.getQuery(),
    });

    if (productItems.length > 0) {
      for (let i = 0; i < productItems.length; i++) {
        if (
          productItems[i].images?.length ||
          productItems[i].mainImage?.public_id
        ) {
          await cloudinary.api.delete_resources_by_prefix(
            `${process.env.cloud_folder}/Products/${productItems[i].customID}`
          );
          await cloudinary.api.delete_folder(
            `${process.env.cloud_folder}/Products/${productItems[i].customID}`
          );
        }
      }
    }

    await product_itemModel.findOneAndDelete({
      productID: this.getQuery(),
    });
  });
};

export const getIDsOfDeletedProducts = (schema) => {
  schema.pre("deleteMany", async function () {
    this.deletedIDs = [];
    await this.model
      .find(this.getQuery())
      .select("_id")
      .then(function (products) {
        this.deletedIDs = products.map((product) => product._id);
      })
      .catch(function (err) {
        console.log(err);
      });
  });
};

export const deleteItemsWithDeleteManyProducts = (schema) => {
  schema.post("deleteMany", async function () {
    await product_itemModel.deleteMany({
      productID: { $in: this.deletedIDs },
    });
  });
};
