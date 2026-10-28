const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./src/utils/logger');

// Load routes
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const appealRoutes = require('./src/routes/appealRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const agencyRoutes = require('./src/routes/agencyRoutes');
const auditRoutes = require('./src/routes/auditRoutes');

const app = express();

// Enable trust proxy for cloud environments (Render, Heroku, reverse proxies)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// CORS config
app.use(cors());

// Compression
app.use(compression());

// Logger requests
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting (with proxy support and loopback skip for internal bot requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  validate: { xForwardedForHeader: false },
  skip: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  },
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Server Error: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
