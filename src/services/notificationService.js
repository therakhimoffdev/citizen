const Notification = require('../models/notification');
const Citizen = require('../models/citizen');
const logger = require('../utils/logger');

const startNotificationDispatcher = (bot) => {
  // Check for unsent notifications every 3 seconds
  setInterval(async () => {
    try {
      const unsent = await Notification.find({ isSent: false })
        .populate('citizen')
        .populate('appeal');
        
      for (const n of unsent) {
        try {
          if (n.citizen && n.citizen.telegramId) {
            const lang = n.citizen.language || 'uz';
            const msgText = n.message[lang] || n.message.uz;
            
            // Format message neatly
            const textToSend = `📢 *Bildirishnoma / Уведомление:*\n\n${msgText}`;
            
            await bot.telegram.sendMessage(n.citizen.telegramId, textToSend, {
              parse_mode: 'Markdown'
            });
            
            n.isSent = true;
            await n.save();
            logger.info(`Instant notification dispatched to telegramId ${n.citizen.telegramId}`);
          } else {
            // Citizen doesn't have telegram ID, mark sent to prevent infinite loops
            n.isSent = true;
            await n.save();
          }
        } catch (err) {
          logger.error(`Failed to send notification ${n._id}: ${err.message}`);
          // Mark sent if the user blocked the bot or chat not found, to avoid infinite retries
          if (err.message.includes('chat not found') || err.message.includes('bot was blocked')) {
            n.isSent = true;
            await n.save();
          }
        }
      }
    } catch (error) {
      logger.error(`Notification dispatcher loop error: ${error.message}`);
    }
  }, 3000);
};

module.exports = { startNotificationDispatcher };
