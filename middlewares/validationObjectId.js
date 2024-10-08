const mongoose = require("mongoose");
function validationObjectId(req, res, next) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: "Error", msg: "Invalid ID" });
  }
  next();
}

module.exports = validationObjectId;
