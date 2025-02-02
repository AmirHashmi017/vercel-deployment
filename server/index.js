const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const axios = require("axios");

const app = express();

// CORS Configuration - Must be before other middleware
const corsOptions = {
  origin: 'https://vercel-deployment-client-topaz.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Duffel-Version'],
  exposedHeaders: ['Content-Type', 'Authorization', 'Duffel-Version'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Enable CORS preflight cache for 24 hours
};

// Apply CORS middleware before routes
app.use(cors(corsOptions));

// Body parser middleware
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
    timeout: 120000, // Increase timeout to 120 seconds
    proxyTimeout: 120000,
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).json({ error: 'Proxy request failed', details: err.message });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log incoming request details
      console.log('Incoming request:', req.method, req.url);
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);

      // Set Duffel-specific headers
      if (req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      } else {
        proxyReq.setHeader('Authorization', `Bearer ${process.env.DUFFEL_TEST_API_KEY}`);
      }
      proxyReq.setHeader('Duffel-Version', 'v2');

      // Handle POST request body
      if (req.method === 'POST' && req.body) {
        const bodyData = JSON.stringify(req.body);
        console.log('Request body being sent to Duffel API:', bodyData);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log proxy response details
      console.log('Proxy response status:', proxyRes.statusCode);
      console.log('Proxy response headers:', proxyRes.headers);

      // Set CORS headers for the response
      proxyRes.headers['Access-Control-Allow-Origin'] = 'https://vercel-deployment-client-topaz.vercel.app';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Duffel-Version';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

      // Log the response body (if needed)
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      proxyRes.on('end', () => {
        console.log('Proxy response body:', body);
      });
    },
    onError: (err, req, res) => {
      // Log proxy errors
      console.error('Proxy error:', err);
      res.status(500).json({
        error: 'Proxy request failed',
        message: err.message,
        code: err.code,
      });
    },
  })
);

app.post("/api/get-flight-offers", async (req, res) => {
  try {
      const requestData = req.body; // The payload from frontend

      const response = await axios.post("https://api.duffel.com/air/offer_requests", requestData, {
          headers: {
              "Content-Type": "application/json",
              "Duffel-Version": "v2",
              "Authorization": `Bearer ${process.env.DUFFEL_TEST_API_KEY}`,
          }
      });

      res.status(200).json(response.data);
  } catch (error) {
      console.error("Error fetching flight offers:", error);
      res.status(500).json({ error: "An error occurred while fetching flight offers." });
  }
});


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
