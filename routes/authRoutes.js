const router = require("express").Router();
const { register, login } = require("../controllers/authControllers");
const {
  registerValidation,
  loginValidation,
} = require("../middlewares/validationSchema");

router.post("/register", registerValidation(), register);
router.post("/login", loginValidation(), login);

module.exports = router;
