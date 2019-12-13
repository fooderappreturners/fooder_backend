const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "fooder"
});

app.get("/fooder", function(req, res) {
  connection.query("SELECT * FROM restaurants", function(err, data) {
    if (err) {
      console.log("Error fetching tasks", err);
      res.status(500).json({
        error: err
      });
    } else {
      res.json({
        restaurants: data
      });
    }
  });
});

module.exports.fooder = serverless(app);