import express from 'express'
import {getAllCategories, createCategory, deleteCategory, updateCategory} from '../../controllers/event/category.controller.js'

const router = express.Router()

router.get('/categories', getAllCategories)
router.post('/createCategory', createCategory)
router.post('/deleteCategory', deleteCategory)
router.post('/updateCategory', updateCategory)

export default router;
