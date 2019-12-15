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

//Return the restaurants whith a specific dietaryOption
app.get("/restaurants/:dietaryOptionId", function(req, res) {

  const dietaryOptionId = req.params.dietaryOptionId;

  const sql = `SELECT r.name, r.capacity, r.location, r.description, r.phoneNumber, r.img FROM restaurants r 
                INNER JOIN restaurantsDietaryOptions rdo 
                ON r.id=rdo.restaunrant_id 
                WHERE rdo.dietaryOption_id = ?`;

  connection.query(sql, [dietaryOptionId], (err, data) => {
    if (err) {
      console.log("Error fetching restaurants", err);
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

//Return all bookings
app.get("/bookings", function(req, res) {  

  const sql = `SELECT * FROM bookings`;

  connection.query(sql, (err, data) => {
    if (err) {
      console.log("Error fetching bookings", err);
      res.status(500).json({
        error: err
      });
    } else {
      res.json({
        bookings: data
      });
    }
  });
});

module.exports.fooder = serverless(app);