import mongoose, { Schema, model } from "mongoose";

const addressSchema = new Schema({
  unit_number: Number,
  street_number: Number,
  address_line1: { type: String, required: true },
  address_line2: String, //For more address details like (dep. num. , building num , PO box num , etc...)
  city: { type: String, required: true },
  region: { type: String, required: true },
  postal_code: { type: String },
  country: { type: String, required: true },
  is_default: {
    type: Boolean,
    default: false,
  },
});

const addressModel = model.Address || mongoose.model("Address", addressSchema);

export default addressModel;
