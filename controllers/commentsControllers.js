const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const { validationResult } = require("express-validator");
const { findById } = require("../models/User");

const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({}).populate("user", ["-password"]);
  res.status(200).json({ status: "Success", comments });
});

const createComment = asyncHandler(async (req, res) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Error", errors: errors.array() });
  }
  const { username, userId } = req.user;
  const { postId, text } = req.body;
  const comment = await Comment.create({
    postId,
    user: userId,
    username,
    text,
  });
  res.status(201).json({ status: "Success", comment });
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Error", errors: errors.array() });
  }
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({ status: "Error", msg: "comment not found" });
  }
  if (userId !== comment.user.toString()) {
    return res.status(403).json({
      status: "Fail",
      msg: "not allowed only owner the comment",
    });
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    {
      text: req.body.text,
    },
    { new: true }
  );

  res.status(200).json({
    status: "Success",
    comment: "updated successfully",
    comment: updatedComment,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, isAdmin } = req.user;
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({ status: "Error", msg: "comment not found" });
  }
  if (isAdmin || userId === comment.user.toString()) {
    await Comment.findByIdAndDelete(id);
    res.status(200).json({
      status: "Success",
      comment: "deleted successfully",
    });
  } else {
    res.status(403).json({
      status: "Fail",
      msg: "not allowed only owner the comment or admin",
    });
  }
});

module.exports = { getComments, createComment, updateComment, deleteComment };
