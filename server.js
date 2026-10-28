require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const bot = require('./src/bot/bot');
const { startNotificationDispatcher } = require('./src/services/notificationService');
const { ensureOrgAdmins } = require('./src/services/ensureOrgAdmins');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 1.1 Ensure 34 Organizations & Credentials exist in Database
    await ensureOrgAdmins();

    // 2. Start Express REST API Server
    const server = app.listen(PORT, () => {
      logger.info(`Express REST API Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });

    // 3. Launch Telegram Bot (Fault-tolerant: Express API keeps running even if bot polling has conflict)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
      try {
        await bot.launch();
        logger.info('Telegraf Telegram Bot successfully launched and polling.');
        
        // 4. Start Background Notification Dispatcher
        startNotificationDispatcher(bot);
        logger.info('Notification dispatcher background service started.');
      } catch (botErr) {
        logger.warn(`Telegram Bot launch warning (conflict or network): ${botErr.message}. REST API remains running.`);
      }
    } else {
      logger.warn('TELEGRAM_BOT_TOKEN is not configured. Telegram Bot and notification dispatcher will not start.');
    }

    // Handle termination signals cleanly
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Express server closed.');
        if (bot && bot.botInfo) {
          bot.stop(signal);
          logger.info('Telegram Bot stopped.');
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    logger.error(`Failed to start services: ${error.message}`);
    process.exit(1);
  }
};

startServer();
