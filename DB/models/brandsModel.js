import mongoose,  { Schema, Types , model } from "mongoose";


const brandsSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique:true
    },
    slug:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    logo:{
        secure_url:{type: String, required: true},
        public_id:{type: String, required: true}
    },
    addedBy:{type: Types.ObjectId, ref:'user' , required: false }, // TODO : make required true after creating user model  
    customID:{type:String , required: true}
} , {timestamps: true})

const brandsModel = model.Brands || mongoose.model('Brands' , brandsSchema)

export default brandsModel