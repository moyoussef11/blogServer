const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  getCountPosts,
} = require("../controllers/postsControllers");
const uploadPhoto = require("../middlewares/photoUpload");
const { createPostValidation } = require("../middlewares/validationSchema");
const { verifyToken } = require("../middlewares/verifyToken");
const validationObjectId = require("../middlewares/validationObjectId");
const router = require("express").Router();

router
  .route("/")
  .get(getPosts)
  .post(
    verifyToken,
    createPostValidation(),
    uploadPhoto.single("image"),
    createPost
  );

router.get("/count", getCountPosts);

router
  .route("/:id")
  .get(validationObjectId, getPost)
  .put(verifyToken, validationObjectId, uploadPhoto.single("image"), updatePost)
  .delete(verifyToken, validationObjectId, deletePost);

router.put("/like/:id", verifyToken, toggleLike);

module.exports = router;
