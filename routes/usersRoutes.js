const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  profilePhotoUpload,
} = require("../controllers/usersControllers");
const uploadPhoto = require("../middlewares/photoUpload");
const validationObjectId = require("../middlewares/validationObjectId");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndHimself,
  verifyTokenAndAdminAndHimself,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

router.route("/").get(verifyToken, verifyTokenAndAdmin, getAllUsers);

router
  .route("/upload-profile-photo/:id")
  .patch(
    verifyToken,
    validationObjectId,
    verifyTokenAndHimself,
    uploadPhoto.single("avatar"),
    profilePhotoUpload
  );

router
  .route("/:id")
  .get(validationObjectId, getUser)
  .patch(verifyToken, validationObjectId, verifyTokenAndHimself, updateUser)
  .delete(
    verifyToken,
    validationObjectId,
    verifyTokenAndAdminAndHimself,
    deleteUser
  );

module.exports = router;
