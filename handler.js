const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "fooder"
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/dietaryOptions", function (req, res) {
  const sql = `SELECT * FROM dietaryOptions`;
  connection.query(sql, (err, data) => {
    if (err) {
      console.log("Error fetching dietary options", err);
      res.status(500).json({
        error: err
      });
    } else {
      res.json({
        dietaryOptions: data
      });
    }
  });
});

//Return the restaurants with a specific dietaryOption
app.get("/restaurants/:dietaryOptionId", function (req, res) {

  const dietaryOptionId = req.params.dietaryOptionId.split(',');
  let placeholders = [];
  dietaryOptionId.forEach(id => {
    placeholders.push('?');
  });

  // returns restaurants with the selected dietary requirements 
  const sql = `SELECT r.id, r.name, r.capacity, r.location, r.description, r.phoneNumber, r.img FROM restaurants r 
                INNER JOIN restaurantsDietaryOptions rdo 
                ON r.id=rdo.restaurant_id 
                WHERE rdo.dietaryOption_id IN (${placeholders.join(',')})`;

  connection.query(sql, dietaryOptionId, (err, data) => {
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
app.get("/bookings", function (req, res) {

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

//Return the bookings filtered by restaurant id
app.get("/bookings/:restaurantId", function (req, res) {

  const restaurantId = req.params.restaurantId;

  const sql = `SELECT * FROM bookings WHERE restaurant_id= ?`;

  connection.query(sql, [restaurantId], (err, data) => {
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

//Add a booking
app.post("/addBooking", function (req, res) {

  const id = null;
  const date = req.body.date;
  const number = req.body.number;
  const name = req.body.name;
  const restaurantId = req.body.restaurantId;

  const sql = `INSERT INTO bookings VALUES (?, ?, ?, ?, ?)`;

  connection.query(sql, [id, date, number, name, restaurantId], (err) => {
    if (err) {
      console.log("Error adding a booking", err);
      res.status(500).json({
        error: err
      });
    } else {
      res.status(201).json({
        id: res.insertId,
        date,
        number,
        name,
        restaurantId
      });
    }
  });
});

//Delete a booking
app.delete("/deleteBooking/:bookingId", function (request, response) {
  const id = request.params.bookingId;

  const sql = 'DELETE FROM bookings WHERE id = ?';

  connection.query(sql, [id], (err, results, fields) => {

    if (err) {
      console.log("Error deleting a booking", err);
      response.status(500).json({
        error: err
      });
    } else {
      response.status(200).json('Removal done');
    }
  });
});

//Return the bookings filtered by restaurant id and date
app.get("/bookingsRestaurantsDate/:restaurantId/:date", function (req, res) {

  const restaurantId = req.params.restaurantId;
  const date = req.params.date;

  const sql = `SELECT * FROM bookings WHERE restaurant_id = ? AND date = ?`;

  connection.query(sql, [restaurantId, date], (err, data) => {
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