require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const connectDp = require("./dp/connect");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/usersRoutes");
const postRouter = require("./routes/postsRoutes");
const commentRouter = require("./routes/commentsRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);



const main = async () => {
  try {
    await connectDp(process.env.MONGO_URI);
    app.listen(process.env.PORT, () => {
      console.log(`Listing on port:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
