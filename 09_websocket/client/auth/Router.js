const express = require("express");
const app = express();
const session = require("express-session");
const filestore = require("session-file-store")(session);
const cookieSession = require("cookie-session");
const cookie = require("cookie");
const Timer = require("./timerModel.js");
const User = require("./userModel.js");
const { nanoid } = require("nanoid");
const router = express.Router();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var bodyParser = require("body-parser");

//cookie
var cookieParser = require("cookie-parser");
router.use(cookieParser());

router.use(
  cookieSession({
    name: "session",
    keys: ["user", "key2"],
    // Cookie Options
    maxAge: 1000 * 60 * 60, //1 minute
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
  const cookies = cookie.parse(req.headers.cookie || "");

  const users = await User.find();

  const findUser = users.filter((item) => item.username == req.body.username && item.password == req.body.password);
  if (findUser.length === 1) {
    res.cookie("user", findUser[0].username);
    req.session.user = findUser[0].username;
    req.session.auth = nanoid();
    res.status(200).render("index", {
      user: findUser[0],
      userToken: req.session.auth,
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
  res.cookie("user", createdUser.username);
  req.session.user = createdUser.username;
  req.session.auth = nanoid();
  res.status(201).render("index", {
    user: createdUser,
    userToken: req.session.auth,
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
