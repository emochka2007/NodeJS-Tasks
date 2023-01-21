const express = require("express");

const mongoose = require("mongoose");

const Timer = require("./timerModel.js");

const { nanoid } = require("nanoid");

var bodyParser = require("body-parser");

const router = express.Router();

const app = express();

app.use(express.json());

var jsonParser = bodyParser.json();

router.get("/timers", async (req, res) => {
  const TIMERS = await Timer.find();
  if (req.query.isActive == "true") {
    const activeTimers = TIMERS.filter((item) => item.isActive == "true");
    res.json(activeTimers);
  } else if (req.query.isActive == "false") {
    console.log(TIMERS.filter((item) => console.log(item._id)));
    const nonactiveTimers = TIMERS.filter((item) => item.isActive == "false");
    res.json(nonactiveTimers);
  }
});
router.post("/timers", jsonParser, async (req, res) => {
  const createdTimer = await Timer.create({
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
  console.log(stoppedTimerAddedDuration);
  res.json(stoppedTimerAddedDuration);
});

module.exports = router;
