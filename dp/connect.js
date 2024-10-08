const mongoose = require("mongoose");

function connectDp(url) {
  mongoose.connect(url).then(() => {
    console.log("DP connecting Done");
  });
}

module.exports = connectDp;
