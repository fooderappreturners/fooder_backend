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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
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

app.get("/restaurants/:dietaryOptionId", function (req, res) {
  const dietaryOptionId = req.params.dietaryOptionId.split(',');
  let placeholders = [];
  dietaryOptionId.forEach(id => {
    placeholders.push('?');
  });
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

app.get("/bookings", function (req, res) {
  const sql = `SELECT bookings.name AS booking_name, bookings.id AS booking_id, restaurants.name AS r_name, restaurants.id AS r_id, location, date, number 
  FROM bookings 
  JOIN restaurants 
  ON bookings.restaurant_Id=restaurants.id`;
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

app.get("/restaurants", function (req, res) {
  const sql = `SELECT * FROM restaurants`;
  connection.query(sql, (err, data) => {
    if (err) {
      console.log("Error fetching bookings", err);
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

app.put("/amendBooking/:bookingId", function (request, response) {
  const bookingId = request.params.bookingId;
  const bookingDate = request.body.date;
  const sql = "UPDATE bookings SET date = ? WHERE id = ?";
  connection.query(sql, [bookingDate, bookingId], (err, results, fields) => {
    if (err) {
      console.log("Error amending booking", err);
      response.status(500).json({
        error: err
      });
    } else {
      response.status(200).json('Amendment complete')
    }
  })
});

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

module.exports.fooder = serverless(app);