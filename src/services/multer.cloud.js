import multer from "multer";



export const uploadFile = (filetype)=>{

    const storage = multer.diskStorage({});

    function fileFiltration(req,file,cb){
 
        if(filetype.includes(file.mimetype)){
            cb(null,true)
        }
        else{
            cb(new Error("Allowed types: jpeg or png ONLY !!"),false)
        }
    }

    const upload = multer({fileFilter:fileFiltration , storage})
   
    return upload  
}
