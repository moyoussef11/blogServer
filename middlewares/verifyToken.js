const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ status: "Error", msg: "unauthorized" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res
      .status(404)
      .json({ status: "Error", msg: "Please provide token!" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(404).json({ status: "Error", msg: " Unexpected token" });
  }
  req.user = {
    userId: decoded.userId,
    username: decoded.username,
    email: decoded.email,
    isAdmin: decoded.isAdmin,
  };
  next();
}

function verifyTokenAndAdmin(req, res, next) {
  verifyToken(
    req,
    res,
    asyncHandler(async () => {
      const isAdmin = req.user.isAdmin;
      if (!isAdmin) {
        return res
          .status(403)
          .json({ status: "Fail", msg: "not allowed , only admin" });
      }
      next();
    })
  );
}

function verifyTokenAndHimself(req, res, next) {
  verifyToken(
    req,
    res,
    asyncHandler(async () => {
      const userId = req.user.userId;
      const id = req.params.id;
      if (userId !== id) {
        return res
          .status(403)
          .json({ status: "Fail", msg: "not allowed , only user himself" });
      }
      next();
    })
  );
}

function verifyTokenAndAdminAndHimself(req, res, next) {
  verifyToken(req, res, () => {
    const { userId, isAdmin } = req.user;
    const id = req.params.id;
    if (userId !== id && !isAdmin) {
      return res
        .status(403)
        .json({ status: "Fail", msg: "not allowed , only user himself or admin" });
    }
    next();
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndHimself,
  verifyTokenAndAdminAndHimself,
};
