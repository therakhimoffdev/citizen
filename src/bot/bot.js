const { Telegraf, Scenes, session } = require('telegraf');
const checkAuth = require('./middlewares/auth');
const startHandler = require('./commands/start');
const helpHandler = require('./commands/help');

const appealWizard = require('./actions/appealWizard');
const trackWizard = require('./actions/trackWizard');
const objectionWizard = require('./actions/objectionWizard');
const ratingWizard = require('./actions/ratingWizard');
const registrationWizard = require('./actions/registrationWizard');

const registerSettingsHandlers = require('./actions/settings');
const registerMyAppealsHandlers = require('./actions/myAppeals');
const registerMessagingHandlers = require('./actions/messaging');
const registerRatingsHandlers = require('./actions/ratings');
const registerNotificationsHandlers = require('./actions/notifications');

const logger = require('../utils/logger');

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Register Telegraf sessions
bot.use(session());

// Register API auth middleware
bot.use(checkAuth);

// Register scenes in Stage
const stage = new Scenes.Stage([
  appealWizard,
  trackWizard,
  objectionWizard,
  ratingWizard,
  registrationWizard
]);
bot.use(stage.middleware());

// Register commands
bot.start(startHandler);
bot.help(helpHandler);

// Register listeners for menu buttons
bot.hears([/📨 New Appeal/, /📨 Новое обращение/, /📨 Yangi murojaat/], async (ctx) => {
  try {
    await ctx.scene.enter('new_appeal_wizard');
  } catch (err) {
    logger.error(`Error entering new appeal scene: ${err.message}`);
  }
});

bot.hears([/🔎 Track Appeal/, /🔎 Отследить обращение/, /🔎 Murojaatni tekshirish/], async (ctx) => {
  try {
    await ctx.scene.enter('track_wizard');
  } catch (err) {
    logger.error(`Error entering track scene: ${err.message}`);
  }
});

bot.hears([/❓ Help/, /❓ Помощь/, /❓ Yordam/], helpHandler);

// Register settings, myAppeals, chat, ratings, notifications action handlers
registerSettingsHandlers(bot);
registerMyAppealsHandlers(bot);
registerMessagingHandlers(bot);
registerRatingsHandlers(bot);
registerNotificationsHandlers(bot);

// Catch-all unhandled command/hears
bot.on('text', async (ctx) => {
  const lang = ctx.session.language || 'uz';
  const welcome = lang === 'uz'
    ? 'Tushunarsiz buyruq. Asosiy menyudan foydalaning.'
    : lang === 'ru'
      ? 'Неподдерживаемая команда. Используйте главное меню.'
      : 'Unknown command. Please use the main menu.';
  ctx.reply(welcome);
});

module.exports = bot;
