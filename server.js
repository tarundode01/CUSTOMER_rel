const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database connection middleware for serverless/local
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Base route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'CRM Unified Backend API running on strict MVC Architecture',
    database: 'MongoDB Atlas Connected',
    endpoints: {
      customer: '/api/customer',
      admin: '/api/admin',
      sales: '/api/sales'
    }
  });
});

// Role-based routes
app.use('/api/customer', require('./routes/customer'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sales', require('./routes/sales'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CRM Unified Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
