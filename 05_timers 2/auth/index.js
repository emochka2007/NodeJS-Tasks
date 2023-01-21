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

// const hash = (d) => null;

// const DB = {
//   users: [
//     {
//       _id: nanoid(),
//       username: "admin",
//       password: hash("pwd007"),
//     },
//   ],
//   sessions: {},
//   timers: [],
// };
app.use(
  cookieSession({
    name: "session",
    keys: ["user", "key2"],
    // Cookie Options
    maxAge: 1000 * 60,
  })
);
app.get("/", (req, res) => {
  if (req.session.user) {
    res.render("index", {
      user: req.session.user,
    });
    return;
  } else {
    res.render("index", {
      user: req.user,
      authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
    });
  }
});

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

// app.get("/api/timers", (req, res) => {
//   if (req.query.isActive == "true") {
//     const activeTimers = TIMERS.filter((item) => item.isActive == true);
//     res.json(activeTimers);
//   } else if (req.query.isActive == "false") {
//     const nonactiveTimers = TIMERS.filter((item) => item.isActive == false);
//     res.json(nonactiveTimers);
//   }
// });
// app.post("/api/timers", (req, res) => {
//   const newElement = TIMERS.push({
//     start: Date.now(),
//     description: req.body.description,
//     isActive: true,
//     id: nanoid(),
//   });
//   res.json(newElement);
// });

// app.post("/api/timers/:id/stop", (req, res) => {
//   const elem = TIMERS.filter((item) => {
//     return item.id == req.params.id;
//   });
//   elem[0].isActive = false;
//   elem[0].end = Date.now() - elem[0].start;
//   elem[0].duration = elem[0].end;
//   res.json(req.params.id + "=" + elem);
// });
