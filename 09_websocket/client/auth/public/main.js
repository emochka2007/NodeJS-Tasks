/*global UIkit, Vue */
const emit = () => {
  socket.emit("all_timers", window.USER_NAME);
  socket.emit("receive_active_timers", window.USER_NAME);
  socket.emit("receive_old_timers", window.USER_NAME);
};
window.addEventListener("load", (event) => {
  emit();
});
document.querySelector("#start-timer").addEventListener("click", () => {
  emit();
});

(() => {
  const notification = (config) =>
    UIkit.notification({
      pos: "top-right",
      timeout: 5000,
      ...config,
    });

  const alert = (message) =>
    notification({
      message,
      status: "danger",
    });

  const info = (message) =>
    notification({
      message,
      status: "success",
    });

  const fetchJson = (...args) =>
    fetch(...args)
      .then((res) =>
        res.ok
          ? res.status !== 204
            ? res.json()
            : null
          : res.text().then((text) => {
              throw new Error(text);
            })
      )
      .catch((err) => {
        alert(err.message);
      });

  new Vue({
    el: "#app",
    data: {
      desc: "",
      activeTimers: [],
      oldTimers: [],
    },
    methods: {
      factiveTimers() {
        socket.on("send_active", (msg) => {
          this.activeTimers = msg;
        });
      },
      foldTimers() {
        socket.on("send_old", (msg) => {
          this.oldTimers = msg;
        });
      },
      createTimer() {
        const description = this.desc;
        this.desc = "";
        const owner = document.querySelector("#userid").innerHTML;
        fetchJson("/api/timers", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description, owner }),
        }).then(({ _id }) => {
          info(`Created new timer "${description}" [${_id}]`);
          this.factiveTimers();
        });
      },
      stopTimer(id) {
        fetchJson(`/api/timers/${id}/stop`, {
          method: "post",
        }).then(() => {
          info(`Stopped the timer [${id}]`);
          this.factiveTimers();
          this.foldTimers();
        });
      },
      formatTime(ts) {
        return new Date(ts).toTimeString().split(" ")[0];
      },
      formatDuration(d) {
        if (d) {
          d = Math.floor(d / 1000);
          const s = d % 60;
          d = Math.floor(d / 60);
          const m = d % 60;
          const h = Math.floor(d / 60);
          return [h > 0 ? h : null, m, s]
            .filter((x) => x !== null)
            .map((x) => (x < 10 ? "0" : "") + x)
            .join(":");
        } else {
          return "0:00";
        }
      },
    },
    created() {
      this.factiveTimers();
      setInterval(() => {
        this.factiveTimers();
      }, 1000);
      this.foldTimers();
    },
  });
})();
