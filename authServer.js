//delar samma secret token
//Dealar med authenication delen av appen
//login, logout, refreshTokens
require("dotenv").config();

const { json } = require("body-parser");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

//Att ha en token som inte har en expiration så kan vem som helst som har tillgång till den
//skapa massa request som om att de skulle vara den usern

app.use(express.json());

//vill spara dessa i en databas egentligen, men nu gör vi det locally.
//ska inte göra detta i production, men för demo purpse så får det duga... Jag får fixa det sen.
//För varje gång man start skiten så töms denna array
let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  //Har vi en valid refreshtoken, eller har vi tagit vort den, funkar den fortfarande?
  if (refreshToken == null) return res.sendStatus(401);
  if (refreshTokens.includes(refreshToken))
    //om den inte finns
    return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

//eftersom vi inte sparar dessa i en databas ännu så kollar vi om refresh token inte lika med den som vi skickar upp till den.
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
  //successfullt deleted
});

app.post("/login", (req, res) => {
  //authenicate the user

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "50s" });
}

app.listen(5000);
