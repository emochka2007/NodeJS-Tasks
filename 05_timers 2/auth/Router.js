const express = require("express");
const session = require("express-session");
const filestore = require("session-file-store")(session);
const cookieSession = require("cookie-session");
const path = require("path");
const mongoose = require("mongoose");

const Timer = require("./timerModel.js");
const User = require("./userModel.js");
const { nanoid } = require("nanoid");
const router = express.Router();
const app = express();
var bodyParser = require("body-parser");

// app.use(
//   session({
//     name: "session-id",
//     secret: "GFGEnter", // Secret key,
//     saveUninitialized: false,
//     resave: false,
//     store: new filestore(),
//   })
// );
router.use(
  cookieSession({
    name: "session",
    keys: ["user", "key2"],
    // Cookie Options
    maxAge: 1000 * 60, //1 minute
  })
);
// configure the app to use bodyParser()
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(bodyParser.json());
app.use("/api", router);
app.use(express.json());

var jsonParser = bodyParser.json();

//login
router.post("/login", async (req, res) => {
  const users = await User.find();
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("user", findUser[0].username, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
  );
  const findUser = users.filter((item) => item.username == req.body.username && item.password == req.body.password);
  if (findUser.length === 1) {
    req.session.user = findUser[0].username;
    req.session.auth = true;
    res.status(200).render("index", {
      user: findUser[0],
    });
  } else {
    res.status(401).render("index", {
      authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
    });
  }
});
//registration
router.post("/signup", jsonParser, async (req, res) => {
  const createdUser = await User.create({
    username: req.body.username,
    password: req.body.password,
  });
  req.session.user = createdUser.username;
  req.session.auth = true;
  res.status(201).render("index", {
    user: createdUser.username,
  });
});
//logout
router.get("/logout", async (req, res) => {
  req.session = null;
  res.status(200).redirect("/");
});
router.get("/timers", async (req, res) => {
  if (!req.session.auth) {
    res.status(401);
    return;
  }
  const TIMERS = await Timer.find();
  const sortByUser = TIMERS.filter((item) => item.owner === req.session.user);
  if (req.query.isActive == "true") {
    const activeTimers = sortByUser.filter((item) => item.isActive == "true");
    res.json(activeTimers);
  } else if (req.query.isActive == "false") {
    const nonactiveTimers = sortByUser.filter((item) => item.isActive == "false");
    res.json(nonactiveTimers);
  }
});
router.post("/timers", jsonParser, async (req, res) => {
  if (!req.session.auth) {
    res.status(401);
    return;
  }
  const createdTimer = await Timer.create({
    owner: req.session.user,
    start: Date.now(),
    end_time: 0,
    duration: 0,
    description: req.body.description,
    isActive: "true",
    _id: nanoid(),
  });
  res.json(createdTimer);
});
router.post("/timers/:id/stop", async (req, res) => {
  if (!req.session.auth) {
    res.status(401);
    return;
  }
  const stoppedTimer = await Timer.findByIdAndUpdate(req.params.id, {
    $set: {
      isActive: "false",
      end_time: Date.now(),
    },
  });
  const stoppedTimerAddedDuration = await Timer.findByIdAndUpdate(req.params.id, {
    $set: {
      duration: Date.now() - stoppedTimer.start,
    },
  });
  res.json(stoppedTimerAddedDuration);
});
module.exports = router;
