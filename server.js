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

/* 
Categories
IMAGES: self explanatory 
Rarity: Legend Rare, Uber Super Rare, Super Rare, Rare, Special, Normal
Form: Normal, Evolved, True, Ultra
Source: Specific gacha banner, advent stage, legend stage, etc.
Role: Sniper, LD, Tank... Go on wiki plz
Target: Which traits they target
Abilities: What abilities the cat has
Cost: price of cat, up or down
Version: When cat was added (only normal form NOT TRUE FORM)
*/
