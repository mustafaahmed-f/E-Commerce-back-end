import mongoose, { Schema, model } from "mongoose";

const user_addressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addresses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
});

const user_addressModel =
  model.UserAddress || mongoose.model("UserAddress", user_addressSchema);

export default user_addressModel;
