const { body } = require("express-validator");
const User = require("../models/User");

const registerValidation = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("username is required")
      .isLength({ min: 3, max: 20 })
      .withMessage("title at least is 3 digits"),
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          res
            .status(400)
            .json({ status: "Fail", msg: "E-mail already in use" });
        }
      })
      .withMessage("E-mail already in use"),
    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 8 }),
  ];
};

const loginValidation = () => {
  return [
    body("email").notEmpty().withMessage("email is required").isEmail(),
    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 8 }),
  ];
};

const createPostValidation = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("title is required")
      .trim()
      .isLength({ min: 3, max: 20 })
      .isString()
      .withMessage("title must be string!!"),
    body("description")
      .notEmpty()
      .withMessage("description is required")
      .isLength({ min: 10 })
      .trim(),
    body("category")
      .notEmpty()
      .withMessage("category is required")
      .trim()
      .isString()
      .withMessage("category must be string!!"),
  ];
};

const createCommentValidation = () => {
  return [
    body("text")
      .notEmpty()
      .withMessage("text is required")
      .trim()
      .isLength({ min: 3 })
      .isString()
      .withMessage("title must be string!!"),
  ];
};

module.exports = {
  registerValidation,
  loginValidation,
  createPostValidation,
  createCommentValidation,
};
