const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const router = require("./Router.js");
const Timer = require("./timerModel.js");
// const startApp = require("./database.js");
require("dotenv").config();
const TIMERS = [];

const app = express();
const PORT = process.env.PORT || 5050;
const DB_URL = process.env.DB_URL;
app.use("/api", router);
const startApp = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => console.log("listening on port " + PORT));
  } catch (e) {
    console.log(e);
  }
};
startApp();

// DB.connect();

// DB.query(`select  * from timers.timers`, (err, res) => {
//   if (!err) {
//     const response = res.rows;
//     response.map((item) => TIMERS.push(item));
//     console.log(TIMERS);
//   } else {
//     console.log(err.message);
//   }
// });

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use("/", (req, res) => {
  res.render("index");
});
