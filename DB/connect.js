import mongoose from "mongoose";


const connection =  async ()=>{
   return await mongoose.connect(process.env.DB_URL).then(()=>{console.log("DB connected");}).catch((err)=>{console.log("DB Connection failed !!" , err);})
}
export default connection