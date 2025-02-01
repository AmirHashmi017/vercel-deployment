const express = require('express');
// const mysql = require('mysql2'); // Use mysql2 instead of mysql
// const bodyParser = require('body-parser');
// const cors = require('cors');

const app = express();
// app.use(cors());
// app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL Connection Pool Setup
// const pool = mysql.createPool({
//   host: '153.92.15.25',
//   user: 'u909769236_info',
//   password: 'Thekidsstoreinfo@25',
//   database: 'u909769236_Flights_System',
//   waitForConnections: true, // Enable waiting for connections
//   connectionLimit: 10, // Limit number of connections in the pool
//   queueLimit: 0, // No limit on the queue length
//   connectTimeout: 10000, // Timeout for establishing a new connection in milliseconds
//   acquireTimeout: 10000, // Timeout for waiting for a connection from the pool in milliseconds
//   timeout: 10000, // Timeout for queries in milliseconds
// });

// // Signup Endpoint
// app.post('/signup', (req, res) => {
//   const { username, password } = req.body;

//   // Check if the username already exists
//   const checkQuery = 'SELECT * FROM Users WHERE username = ?';
//   pool.query(checkQuery, [username], (err, results) => {
//     if (err) {
//       res.status(500).json({ error: 'Error checking user data' });
//       return;
//     }

//     if (results.length > 0) {
//       // Username already exists
//       res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
//     } else {
//       // Insert new user if username is unique
//       const insertQuery = 'INSERT INTO Users (username, userpassword) VALUES (?, ?)';
//       pool.query(insertQuery, [username, password], (err, result) => {
//         if (err) {
//           res.status(500).json({ error: 'Error inserting user data' });
//           return;
//         }
//         res.status(200).json({ message: 'Signup successful!' });
//       });
//     }
//   });
// });

// // Login Endpoint
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   const query = 'SELECT * FROM Users WHERE username = ? AND userpassword = ?';
//   pool.query(query, [username, password], (err, results) => {
//     if (err) {
//       res.status(500).json({ error: 'Error fetching user data' });
//       return;
//     }
//     if (results.length > 0) {
//       res.status(200).json({ message: 'Login successful!', user: results[0] });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   });
// });
// app.post('/bookings', (req, res) => {
//   const { username, orderid } = req.body;

//   if (!username || !orderid) {
//     return res.status(400).json({ error: "Username and Order ID are required" });
//   }

//   const insertQuery = 'INSERT INTO Bookings (username, orderid) VALUES (?, ?)';
//   pool.query(insertQuery, [username, orderid], (err, result) => {
//     if (err) {
//       res.status(500).json({ error: 'Error inserting booking data' });
//       return;
//     }
//     res.status(200).json({ message: 'Booking saved successfully!' });
//   });
// });

// //  **Get all bookings for a user**
// app.get('/bookings/:username', (req, res) => {
//   const { username } = req.params;

//   const query = 'SELECT orderid FROM Bookings WHERE username = ?';
//   pool.query(query, [username], (err, results) => {
//     if (err) {
//       res.status(500).json({ error: 'Error fetching booking data' });
//       return;
//     }
//     if (results.length > 0) {
//       res.status(200).json({ orders: results.map(row => row.orderid) });
//     } else {
      
//       res.status(404).json({ message: 'No bookings found for this user' });
//     }
//   });
// });

// Start Server
app.use("/",(req,res)=>
{
  res.send("Server is running");
})
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
