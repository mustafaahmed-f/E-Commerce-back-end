import mongoose, { Schema, model } from "mongoose";

const user_addressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  is_default: {
    type: Boolean,
    default: false,
  },
});

const user_addressModel =
  model.UserAddress || mongoose.model("UserAddress", user_addressSchema);

export default user_addressModel;
