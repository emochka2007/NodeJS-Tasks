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

router.use(
  cookieSession({
    name: "session",
    keys: ["user", "key2"],
    // Cookie Options
    maxAge: 1000 * 60, //1 minute
  })
);
app.use("/api", router);
app.use(express.json());

var jsonParser = bodyParser.json();

//login
router.post("/login/:sessionId", jsonParser, async (req, res) => {
  const users = await User.find();
  const findUser = users.filter(
    (item) =>
      item.username == req.body.username && item.password == req.body.password
  );
  if (findUser.length === 1) {
    req.session.user = findUser[0].username;
    req.session.auth = true;
    if (req.params.sessionId) {
      res.json(req.params.sessionId);
    } else {
      res.json({
        error: "Invalid session",
      });
    }
  } else {
    console.log("user not found");
  }
});
//registration
router.post("/signup/:sessionId", jsonParser, async (req, res) => {
  try {
    const createdUser = await User.create({
      username: req.body.username,
      password: req.body.password,
    });
    if (req.params.sessionId) {
      res.send(req.params.sessionId);
    } else {
      res.send({
        error: "Invalid session",
      });
    }
  } catch (e) {
    console.error("User not created", e);
  }
});
//logout
router.get("/logout", async (req, res) => {
  // req.session = null;
  // res.status(200).redirect("/");
  res.json({});
});
router.get("/timers/:user", async (req, res) => {
  // if (!req.session.auth) {
  //   res.status(401);
  //   return;
  // }
  console.log(req.params);
  const TIMERS = await Timer.find();
  const sortByUser = TIMERS.filter((item) => item.owner === req.params.user);
  if (req.query.isActive == "true") {
    const activeTimers = sortByUser.filter((item) => item.isActive == "true");
    res.json(activeTimers);
  } else if (req.query.isActive == "false") {
    const nonactiveTimers = sortByUser.filter(
      (item) => item.isActive == "false"
    );
    res.json(nonactiveTimers);
  }
});
router.post("/timers", jsonParser, async (req, res) => {
  // if (!req.session.auth) {
  //   res.status(401);
  //   return;
  // }
  const createdTimer = await Timer.create({
    owner: req.body.owner,
    start: Date.now(),
    end_time: 0,
    duration: 0,
    description: req.body.description,
    isActive: "true",
    _id: nanoid(),
  });
  console.log(createdTimer);
  res.json(createdTimer._id);
});
router.post("/timers/:id/stop", async (req, res) => {
  // if (!req.session.auth) {
  //   res.status(401);
  //   return;
  // }
  const stoppedTimer = await Timer.findByIdAndUpdate(req.params.id, {
    $set: {
      isActive: "false",
      end_time: Date.now(),
    },
  });
  const stoppedTimerAddedDuration = await Timer.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        duration: Date.now() - stoppedTimer.start,
      },
    }
  );
  res.json(stoppedTimerAddedDuration._id);
});
router.get("/timers/:id", async (req, res) => {
  const timer = await Timer.findById(req.params.id);
  res.json(timer);
});
module.exports = router;
