const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");
const { Client } = require("pg");
require("dotenv").config();
const TIMERS = [];

const DB = new Client({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.PORT,
  password: process.env.ROOT,
  database: process.env.DATABASE,
});

DB.connect();

DB.query(`select  * from timers.timers`, (err, res) => {
  if (!err) {
    const response = res.rows;
    response.map((item) => TIMERS.push(item));
    console.log(TIMERS);
  } else {
    console.log(err.message);
  }
});

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

// const TIMERS = [
//   {
//     start: Date.now(),
//     description: "Timer 1",
//     isActive: true,
//     id: nanoid(),
//   },
//   {
//     start: Date.now() - 5000,
//     end: Date.now() - 3000,
//     duration: 2000,
//     description: "Timer 0",
//     isActive: false,
//     id: nanoid(),
//   },
// ];

app.get("/api/timers", (req, res) => {
  if (req.query.isActive == "true") {
    const activeTimers = TIMERS.filter((item) => item.isactive == "true");
    res.json(activeTimers);
  } else if (req.query.isActive == "false") {
    const nonactiveTimers = TIMERS.filter((item) => item.isactive == "false");
    res.json(nonactiveTimers);
  }
});
app.post("/api/timers", (req, res) => {
  // const newElement = TIMERS.push({
  //   start: Date.now(),
  //   description: req.body.description,
  //   isActive: true,
  //   id: nanoid(),
  // });
  DB.query(
    `INSERT INTO timers.timers (start, description, isActive, id) VALUES (${Date.now()}, '${
      req.body.description
    }', '${true}',' ${nanoid()}')`
  );
  res.json(TIMERS);
});

app.post("/api/timers/:id/stop", (req, res) => {
  const elem = TIMERS.filter((item) => {
    return item.id == req.params.id;
  });
  DB.query(
    `UPDATE timers.timers SET isactive='false', end_time=${Date.now()}, duration=${
      Date.now() - elem[0].start
    } where id='${req.params.id}'`
  );
  // elem[0].isActive = false;
  // elem[0].end = Date.now() - elem[0].start;
  // elem[0].duration = elem[0].end;
  res.json(req.params.id + "=" + elem);
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
