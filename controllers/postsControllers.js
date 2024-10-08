const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const { validationResult } = require("express-validator");
const path = require("path");
const {
  cloudinaryUploadPhoto,
  removeImageCloudinary,
} = require("../utils/cloudinary");
const fs = require("fs");

const getPosts = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  let posts;
  const { pageNum, category } = req.query;
  if (pageNum) {
    posts = await Post.find({}, { __v: false })
      .skip((pageNum - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  } else if (category) {
    posts = await Post.find({ category }, { __v: false })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  } else {
    posts = await Post.find({}, { __v: false })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  }
  res.status(200).json({ status: "Success", posts });
});
const getCountPosts = asyncHandler(async (req, res) => {
  const count = await Post.find();
  res.status(200).json({ status: "Success", count: count.length });
});

const createPost = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Fail", errors: errors.array() });
  }
  if (!req.file) {
    return res.status(400).json({ status: "Error", msg: "no file provided" });
  }
  const imagePath =
    path.join(__dirname, `../images/${req.file.filename}`) || req.file.path;

  const result = await cloudinaryUploadPhoto(imagePath);

  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    user: userId,
    category: req.body.category,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  res.status(201).json({ status: "Success", post });
  fs.unlinkSync(imagePath);
});

const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id, { __v: false })
    .populate("user", ["-password", "-__v"])
    .populate("comments");
  if (!post) {
    return res.status(404).json({ status: "Error", msg: "Post not found" });
  }
  res.status(200).json({ status: "Success", post });
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ status: "Error", msg: "Post not found" });
  }
  if (post.user.toString() !== req.user.userId) {
    return res
      .status(403)
      .json({ status: "Fail", msg: "not allowed, only owner the post" });
  }
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Fail", errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ status: "Error", msg: "no file provided" });
  }
  if (post.image.publicId !== null) {
    await removeImageCloudinary(post.image.publicId);
  }

  const pathImage = path.join(__dirname, `../images/${req.file.filename}`);

  const result = await cloudinaryUploadPhoto(pathImage);

  const postUpdated = await Post.findByIdAndUpdate(
    id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  res.status(201).json({ status: "Success", post: postUpdated });
  fs.unlinkSync(pathImage);
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ status: "Error", msg: "Post not found" });
  }
  if (post.user.toString() !== req.user.userId && !req.user.isAdmin) {
    return res.status(403).json({
      status: "Fail",
      msg: "not allowed, only owner the post or admin",
    });
  }
  await Post.findByIdAndDelete(id);
  res.status(200).json({ status: "Success", msg: "deleted successfully" });
});

const toggleLike = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  let post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ status: "Error", msg: "Post not found" });
  }

  const postIsLiked = post.likes.find((user) => user.toString() === userId);
  if (postIsLiked) {
    post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { likes: userId },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      id,
      {
        $push: { likes: userId },
      },
      { new: true }
    );
  }
  res.status(200).json({ status: "Success", post });
});

module.exports = {
  getPosts,
  getCountPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
};
