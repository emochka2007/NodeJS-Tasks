//nodemon --no-stdin -command to not show pass while typing
const os = require("os");
const express = require("express");
const axios = require("axios");
const app = express();
const fs = require("fs");
const { dirname } = require("path");
//npm install --save inquirer@^8.0.0
const inquirer = require("inquirer");
const { password } = require("inquirer");
const path = require("path");
const appDir = dirname(require.main.filename);
const sessionFileName = path.join(appDir + "/sb-timers-session");
let commandName = process.argv[2];
// console.log("File to keep the session ID:", sessionFileName);
let username;
//nodemon index.js login --no-stdin
if (commandName === "login") {
  inquirer
    .prompt([
      {
        name: "Username",
        message: "Enter your username",
      },
      {
        type: "password",
        name: "Password",
        message: "Enter your password",
      },
    ])
    .then((answers) => {
      console.log(answers.Username);
      username = answers.Username;
      axios
        .post(`http://localhost:5050/api/login/${answers.Username}`, {
          username: answers.Username,
          password: answers.Password,
        })
        .then((response) => {
          if (response.data) {
            const session = response.data;
            fs.writeFileSync(sessionFileName, session.toString());
            console.log("Logged in successfully!");
          } else {
            console.log("Wrong username or password!");
          }
        });
    });
} else if (commandName === "logout") {
  fs.writeFileSync(sessionFileName, "");
} else if (commandName === "signup") {
  //nodemon index.js signup  --no-stdin
  inquirer
    .prompt([
      {
        name: "Username",
        message: "Enter your username",
      },
      {
        type: "password",
        name: "Password",
        message: "Enter your password",
      },
    ])
    .then((answers) => {
      console.log(answers.Username);
      username = answers.Username;
      axios
        .post(`http://localhost:5050/api/signup/${answers.Username}`, {
          username: answers.Username,
          password: answers.Password,
        })
        .then((response) => {
          if (response.data) {
            const session = response.data;
            fs.writeFileSync(sessionFileName, session.toString());
            console.log("Signed up successfully");
          }
        });
    });
} else if (commandName === "start") {
  let description = process.argv[3];
  const data = fs.readFileSync(sessionFileName, "utf8");
  if (description) {
    axios
      .post(`http://localhost:5050/api/timers`, {
        owner: data,
        description: description,
      })
      .then((response) => {
        if (response.data) {
          console.log("Started Timer " + description + ", :" + response.data);
        }
      });
  } else {
    console.log("Description empty");
    return;
  }
} else if (commandName === "stop") {
  let id = process.argv[3];
  if (id) {
    axios.post(`http://localhost:5050/api/timers/${id}/stop`).then((response) => {
      if (response.data) {
        console.log("Timer stopped successfully: " + response.data);
      }
    });
  } else {
    console.log("Description empty");
    return;
  }
} else if (commandName === "status" && !process.argv[3]) {
  const session = fs.readFileSync(sessionFileName, "utf8");
  axios.get(`http://localhost:5050/api/timers/${session}?isActive=true`).then((response) => {
    if (response) {
      let activeTimers = response.data;
      activeTimers = activeTimers.map((item) => ({ ...item, duration: item.duration / 1000 + " sec" }));
      console.table(activeTimers, ["_id", "description", "duration"]);
    }
  });
} else if (commandName === "status" && process.argv[3]) {
  let id = process.argv[3];
  const session = fs.readFileSync(sessionFileName, "utf8");
  axios.get(`http://localhost:5050/api/timers/${session}?isActive=true`).then((response) => {
    if (response) {
      const timerById = response.data.filter((t) => t._id === id);
      console.table(timerById);
    }
  });
} else if (commandName === "statusold") {
  const session = fs.readFileSync(sessionFileName, "utf8");
  axios.get(`http://localhost:5050/api/timers/${session}?isActive=false`).then((response) => {
    if (response) {
      let oldTimers = response.data;
      oldTimers = oldTimers.map((item) => ({ ...item, duration: item.duration / 1000 + " sec" }));
      console.log(oldTimers);
      console.table(oldTimers, ["_id", "description", "duration"]);
    }
  });
}
