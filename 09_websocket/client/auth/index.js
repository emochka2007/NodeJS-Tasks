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
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
var cookieParser = require("cookie-parser");

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,UPDATE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
});
app.use("/api", router);
app.use(cookieParser());
const cookie = require("cookie");

(async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    server.listen(PORT, () => console.log("listening on port " + PORT));
  } catch (e) {
    console.log(e);
  }
})();
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

app.use(
  cookieSession({
    name: "session",
    keys: ["user", "key2"],
    // Cookie Options
    maxAge: 1000 * 60 * 60,
  })
);

app.get("/", async (req, res) => {
  // const user = await req.cookies;
  if (req.session.user) {
    res.render("index", {
      user: req.session.user,
    });
    return;
  } else {
    res.render("index", {
      user: req.session.user,
      authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
    });
  }
});

//socket
io.on("connection", async (socket) => {
  console.log("connection");
  socket.on("all_timers", async (msg) => {
    const timers = await Timer.find();
    const sortedTimers = timers.filter((item) => item.owner == msg);
    io.emit("send_all", sortedTimers);
  });
  socket.on("receive_active_timers", async (msg) => {
    const timers = await Timer.find();
    const sortedTimers = timers.filter((item) => item.owner == msg);
    console.log(sortedTimers);
    const activeTimers = sortedTimers.filter((item) => item.isActive == "true");
    io.emit("send_active", activeTimers);
  });
  socket.on("receive_old_timers", async (msg) => {
    const timers = await Timer.find();
    const sortedTimers = timers.filter((item) => item.owner == msg);
    const oldTimers = sortedTimers.filter((item) => item.isActive == "false");
    io.emit("send_old", oldTimers);
  });
});
