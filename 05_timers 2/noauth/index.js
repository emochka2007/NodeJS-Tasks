const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");

const app = express();

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

app.get("/", (req, res) => {
  res.render("index");
});

// You can use these initial data

const TIMERS = [
  {
    start: Date.now(),
    description: "Timer 1",
    isActive: true,
    id: nanoid(),
  },
  {
    start: Date.now() - 5000,
    end: Date.now() - 3000,
    duration: 2000,
    description: "Timer 0",
    isActive: false,
    id: nanoid(),
  },
];

app.get("/api/timers", (req, res) => {
  if (req.query.isActive == "true") {
    const activeTimers = TIMERS.filter((item) => item.isActive == true);
    res.json(activeTimers);
  } else if (req.query.isActive == "false") {
    const nonactiveTimers = TIMERS.filter((item) => item.isActive == false);
    res.json(nonactiveTimers);
  }
});
app.post("/api/timers", (req, res) => {
  const newElement = TIMERS.push({
    start: Date.now(),
    description: req.body.description,
    isActive: true,
    id: nanoid(),
  });
  res.json(newElement);
});

app.post("/api/timers/:id/stop", (req, res) => {
  const elem = TIMERS.filter((item) => {
    return item.id == req.params.id;
  });
  elem[0].isActive = false;
  elem[0].end = Date.now() - elem[0].start;
  elem[0].duration = elem[0].end;
  res.json(req.params.id + "=" + elem);
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
