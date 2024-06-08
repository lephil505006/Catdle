const express = require("express");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
const port = process.env.PORT;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Catdle game is running on http://localhost:${port}`);
});
