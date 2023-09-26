import {v2 as cloudinary} from 'cloudinary';
// import { config } from "dotenv";
// import path from 'path'
// config({path:path.resolve('../../config/config.env')})

// console.log(process.env.cloud_name);
// console.log("asdfasegfad");

cloudinary.config({ 
  cloud_name: "dvvmu40wx", 
  api_key: '369872118135466', 
  api_secret: "F4DMU7WejhSt1B-pRVzKHwq7O5M",
  secure:true
});

export default cloudinary

// cloudinary.config({ 
//   cloud_name: 'sample', 
//   api_key: '874837483274837', 
//   api_secret: 'a676b67565c6767a6767d6767f676fe1',
//   secure: true
// }); 

// export default cloudinary

