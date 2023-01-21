const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const router = require("./Router.js");
const Timer = require("./timerModel.js");
const User = require("./userModel.js");
const session = require("express-session");
const filestore = require("session-file-store")(session);
const cookieSession = require("cookie-session");
var bodyParser = require("body-parser");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

const app = express();
app.use("/api", router);

(async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => console.log("listening on port " + PORT));
  } catch (e) {
    console.log(e);
  }
})();

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));

app.use(
  cookieSession({
    name: "session",
    keys: ["user", "key2"],
    // Cookie Options
    maxAge: 1000 * 60,
  })
);
