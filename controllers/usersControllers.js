const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadPhoto,
  removeImageCloudinary,
  removeImagesCloudinary,
} = require("../utils/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-__v").populate("posts");
  res.status(200).json({ status: "Success", users, count: users.length });
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id, { __v: false })
    .select("-password")
    .populate("posts");
  if (!user) {
    return res.status(404).json({ status: "Error", msg: "user not Found" });
  }
  res.status(200).json({ status: "Success", user });
});
const profilePhotoUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "Error", msg: "no file provided" });
  }
  const imagePath =
    req.file.path || path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadPhoto(imagePath);
  const user = await User.findById(req.user.userId);

  if (user.avatar.publicId !== null) {
    await removeImageCloudinary(user.avatar.publicId);
  }
  user.avatar = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  res.status(200).json({
    status: "Success",
    avatar: { url: result.secure_url, publicId: result.public_id },
    msg: "uploaded photo successfully",
  });
  fs.unlinkSync(imagePath);
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  if (!username) {
    return res
      .status(400)
      .json({ status: "Fail", msg: "Please fill the inputName " });
  }
  let newPassword;
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    newPassword = hashedPassword;
  }
  await User.findByIdAndUpdate(id, {
    $set: {
      username: username,
      password: newPassword,
    },
  });
  res.status(200).json({ status: "Success", msg: "updated successfully" });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("posts");
  if (!user) {
    return res.status(404).json({ status: "Error", msg: "user not Found" });
  }
  const posts = await Post.find({ user: user._id });
  const publicIds = posts?.map((post) => post.image.publicId);
  if (publicIds?.length > 0) {
    await removeImagesCloudinary(publicIds);
  }

  if (user.avatar.publicId !== null) {
    await removeImageCloudinary(user.avatar.publicId);
  }

  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  await User.findByIdAndDelete(id);
  res.status(200).json({ status: "Success", msg: "Deleted successfully" });
});

module.exports = {
  getAllUsers,
  getUser,
  profilePhotoUpload,
  updateUser,
  deleteUser,
};
