import EventCategory from '../../models/event/category.model.js'
import { sendResponse } from '../../utils/response.util.js';

export async function createCategory(req, res) {
  try {
    const categoryRequest = req.body;
    if (!categoryRequest || !categoryRequest.title || !categoryRequest.description || !categoryRequest.image) {
      return sendResponse(res, 400, false, "Category title, description and image are required");
    }

    const category = await EventCategory.create(categoryRequest);
    return sendResponse(res, 201, true, "Category created successfully", { data: category });
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function updateCategory(req, res) {
 try {
    const { title, description, image, tags, categoryId} = req.body;

    const category = await EventCategory.findById(categoryId);
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }

    category.title = title;
    category.description = description;
    category.image = image;
    category.tags = tags;

    await category.save();
    return sendResponse(res, 200, true, "Category updated successfully", { data: category });
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.body;
    const category = await EventCategory.findById(categoryId);
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }

    await EventCategory.findByIdAndDelete(categoryId);
    return sendResponse(res, 200, true, "Category deleted successfully");
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

export async function getAllCategories(req, res) {
  try {
    const categories = await EventCategory.find({});

    if (!categories.length) {
      return sendResponse(res, 404, false, "No Categories Found");
    }

    return sendResponse(res, 200, true, "Categories fetched successfully", { categories });
  } catch (e) {
    return sendResponse(res, 500, false, e.message || "Internal Server Error");
  }
}

