import Tags from "../models/tags.model.js";

// GET /api/tags
export async function getTags(req, res) {
  try {
    const tagsList = await Tags.find();

    if (!tagsList.length) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No tags available",
        data: [],
      });
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Tags fetched successfully",
      data: tagsList,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server error while fetching tags",
      errors: error.message,
    });
  }
}

// POST /api/tags
export async function createTag(req, res) {
  try {
    const tags = req.body.tags;
    console.log(tags)

    if (!Array.isArray(tags) || !tags.length) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Tags array is required in request body",
      });
    }

    let duplicateTags = [];

    // Check for duplicates one by one
    for (const tag of tags) {
      const exists = await Tags.findOne({ tag });
      if (exists) duplicateTags.push(tag);
    }

    if (duplicateTags.length > 0) {
      return res.status(409).json({
        statusCode: 409,
        success: false,
        message: "Some tags already exist",
        errors: { duplicateTags },
      });
    }

    const insertedTags = await Tags.insertMany(tags.map(tag => ({ name: tag })));

    return res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Tags created successfully",
      data: insertedTags,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server error while creating tags",
      errors: error.message,
    });
  }
}
