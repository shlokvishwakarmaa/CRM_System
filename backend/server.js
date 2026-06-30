import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LeadCRM API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to LeadCRM API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 LeadCRM API Server`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server running on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;
