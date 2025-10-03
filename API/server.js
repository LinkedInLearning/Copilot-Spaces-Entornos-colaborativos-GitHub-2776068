import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import marketsRouter from './routes/markets.js';
import suppliersRouter from './routes/suppliers.js';
import currencyRouter from './routes/currency.js';
import tariffRouter from './routes/tariff.js';
import tradeRouter from './routes/trade.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/markets', marketsRouter);
app.use('/api/v1/suppliers', suppliersRouter);
app.use('/api/v1/currency', currencyRouter);
app.use('/api/v1/tariff', tariffRouter);
app.use('/api/v1/trade', tradeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Comercio Internacional API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'Comercio Internacional API',
    version: '1.0.0',
    description: 'REST API for international commerce operations',
    endpoints: {
      markets: '/api/v1/markets',
      suppliers: '/api/v1/suppliers',
      currency: '/api/v1/currency',
      tariff: '/api/v1/tariff',
      trade: '/api/v1/trade'
    },
    documentation: {
      health: 'GET /health',
      info: 'GET /api/v1'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on our end'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Comercio Internacional API server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health check available at http://localhost:${PORT}/health`);
});

export default app;