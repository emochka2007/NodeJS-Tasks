const crypto = require("crypto");
const fs = require("fs");
let filePath = process.argv[2];
const filename = "./test.txt";
const hash = crypto.createHash("sha256");

const input = fs.createReadStream(filePath);
input.on("readable", () => {
  // Only one element is going to be produced by the
  // hash stream.
  const data = input.read();
  if (data) hash.update(data);
  else {
    console.log(`${hash.digest("hex")}`);
  }
});
