const router = require("express").Router();
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentsControllers");
const validationObjectId = require("../middlewares/validationObjectId");
const { createCommentValidation } = require("../middlewares/validationSchema");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

router
  .route("/")
  .get(verifyTokenAndAdmin, getComments)
  .post(verifyToken, createCommentValidation(), createComment);

router
  .route("/:id")
  .put(
    verifyToken,
    validationObjectId,
    createCommentValidation(),
    updateComment
  )
  .delete(verifyToken, validationObjectId, deleteComment);

module.exports = router;
