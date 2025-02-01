const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: 'https://vercel-deployment-client-topaz.vercel.app', // Allow requests from your frontend
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Duffel-Version'], // Allow these headers
    credentials: true, // Allow credentials (if needed)
  })
);

// Handle preflight OPTIONS requests
app.options('*', cors()); // Enable preflight requests for all routes

app.use(bodyParser.json());

// MySQL Connection Pool Setup
const pool = mysql.createPool({
  host: '153.92.15.25',
  user: 'u909769236_info',
  password: 'Thekidsstoreinfo@25',
  database: 'u909769236_Flights_System',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Proxy middleware for Duffel API
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://api.duffel.com',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Setting Authorization header...');
      console.log('API Key:', process.env.DUFFEL_TEST_API_KEY); // Log the API key
      proxyReq.setHeader('Authorization', `Bearer ${process.env.DUFFEL_TEST_API_KEY}`);
      proxyReq.setHeader('Duffel-Version', 'v2');
      if (req.body) {
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    },
  })
);

// Signup Endpoint
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const checkQuery = 'SELECT * FROM Users WHERE username = ?';
  pool.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error checking user data' });

    if (results.length > 0) {
      res.status(409).json({ error: 'Username already exists.' });
    } else {
      const insertQuery = 'INSERT INTO Users (username, userpassword) VALUES (?, ?)';
      pool.query(insertQuery, [username, password], (err) => {
        if (err) return res.status(500).json({ error: 'Error inserting user data' });
        res.status(200).json({ message: 'Signup successful!' });
      });
    }
  });
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM Users WHERE username = ? AND userpassword = ?';
  pool.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching user data' });

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful!', user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get all bookings for a user
app.get('/bookings/:username', (req, res) => {
  const { username } = req.params;
  const query = 'SELECT orderid FROM Bookings WHERE username = ?';
  pool.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching booking data' });

    if (results.length > 0) {
      res.status(200).json({ orders: results.map(row => row.orderid) });
    } else {
      res.status(404).json({ message: 'No bookings found for this user' });
    }
  });
});

// Export Express app as a Vercel serverless function
module.exports = app;
