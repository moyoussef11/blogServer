const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { validationResult } = require("express-validator");

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Fail", errors: errors.array() });
  }
  const user = await User.create(req.body);
  res.status(201).json({ status: "Success", data: user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Fail", errors: errors.array() });
  }
  
  const user = await User.findOne({ email }, { __v: false });
  if (!user) {
    return res.status(404).json({ status: "Error", msg: "user not found" });
  }
  const passwordMatch = await user.comparePassword(password);  
  if (!passwordMatch) {
    return res.status(400).json({ status: "Fail", msg: "password invalid" });
  }
  const token = user.createJwt();
  res.status(200).json({ status: "Success", user, token });
});

module.exports = { register, login };
