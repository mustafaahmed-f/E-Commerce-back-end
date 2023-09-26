import joi from 'joi'
import { generalValidation } from '../../middlewares/validation.js'



export const addCategory = {
    body:joi.object({
        name:generalValidation.name,
        // authorization:generalValidation.authorization //TODO : uncomment authorization after creating user model and tokens
    }).required(),
}

export const updateCategory = {
    body:joi.object({
        name:generalValidation.name,
        
    }),
    query:joi.object({
        categoryID:generalValidation._id
    })
}

export const deleteCategory = {
    query:joi.object({
        _id:generalValidation._id
    })
}