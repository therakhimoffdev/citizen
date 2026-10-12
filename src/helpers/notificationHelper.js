const Notification = require('../models/notification');
const Citizen = require('../models/citizen');
const logger = require('../utils/logger');

// Send notification helper: saves to DB and triggers Bot notification send (via callback or polling, or direct bot import)
// Note: In modular design, bot.js can poll or listen to notifications, or we can directly send via bot instance if available.
// Since we want decoupled architecture, we can save to Database. 
// When the bot starts, we can have a cron-job or event-listener or simple function that checks for pending notifications and sends them using bot.telegram.sendMessage.
const createStatusNotification = async (appeal, status) => {
  try {
    const citizen = await Citizen.findById(appeal.citizen);
    if (!citizen || !citizen.notificationEnabled) return;

    let message = { uz: '', ru: '', en: '' };
    const num = appeal.appealNumber;

    switch (status) {
      case 'Accepted':
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz qabul qilindi.`,
          ru: `Ваше обращение ${num} было принято.`,
          en: `Your appeal ${num} has been accepted.`
        };
        break;
      case 'Assigned':
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz mas'ul xodimga biriktirildi.`,
          ru: `Ваше обращение ${num} было назначено ответственному сотруднику.`,
          en: `Your appeal ${num} has been assigned to an employee.`
        };
        break;
      case 'In Progress':
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz ko'rib chiqilmoqda.`,
          ru: `Ваше обращение ${num} находится в процессе рассмотрения.`,
          en: `Your appeal ${num} is in progress.`
        };
        break;
      case 'Completed':
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz bajarildi. Iltimos, sifatni baholang!`,
          ru: `Ваше обращение ${num} завершено. Пожалуйста, оцените качество!`,
          en: `Your appeal ${num} has been completed. Please rate the service!`
        };
        break;
      case 'Rejected':
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz rad etildi.`,
          ru: `Ваше обращение ${num} было отклонено.`,
          en: `Your appeal ${num} has been rejected.`
        };
        break;
      case 'Returned':
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz qaytarildi.`,
          ru: `Ваше обращение ${num} было возвращено.`,
          en: `Your appeal ${num} has been returned.`
        };
        break;
      case 'Under Review': // Objection submitted
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz bo'yicha e'tiroz qabul qilindi va qayta ko'rib chiqilmoqda.`,
          ru: `Ваше возражение по обращению ${num} принято и рассматривается.`,
          en: `Your objection for appeal ${num} has been received and is under review.`
        };
        break;
      default:
        message = {
          uz: `Sizning ${num} raqamli murojaatingiz holati o'zgardi: ${status}.`,
          ru: `Статус вашего обращения ${num} изменился: ${status}.`,
          en: `Status of your appeal ${num} has changed: ${status}.`
        };
    }

    const notification = await Notification.create({
      citizen: citizen._id,
      appeal: appeal._id,
      type: status === 'Under Review' ? 'ObjectionProcessed' : 'StatusChanged',
      message
    });

    // If bot is imported globally, we can trigger direct message send.
    // We will handle that inside the bot startup loop by running a small notification cron/poller.
    logger.info(`Notification saved for citizen ${citizen.telegramId}: ${status}`);
    return notification;
  } catch (error) {
    logger.error(`Error creating status notification: ${error.message}`);
  }
};

module.exports = { createStatusNotification };
