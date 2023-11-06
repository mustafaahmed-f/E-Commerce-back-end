import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "superAdmin"],
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline"],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      enum: ["true", "false"],
    },
    profileImage: {
      secure_url: String,
      public_id: String,
    },
    deactivated: {
      type: Boolean,
      default: false,
      enum: ["true", "false"],
    },
    gender: {
      type: String,
      default: "male",
      enum: ["male", "female"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
      enum: ["true", "false"],
    },
    customID: String,
    birthDate: String,
    numOfConfirmRequests: { type: Number, default: 0 },
    numOfAddresses: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //This causes an additional id field to appear in the response body.
    toObject: { virtuals: true },
  }
);

userSchema.virtual("user_address", {
  ref: "UserAddress",
  localField: "_id",
  foreignField: "user_id",
  justOne: true,
});

userSchema.pre("save", function () {
  this.password = bcrypt.hashSync(
    this.password,
    parseInt(process.env.SALT_ROUND)
  );
});

userSchema.post(
  "findOneAndUpdate",

  async function () {
    const user = await this.model.findOne(this.getQuery());
    try {
      await user.save();
    } catch (error) {
      console.log(error);
    }
  }
);

const userModel = model.User || mongoose.model("User", userSchema);

export default userModel;
