const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const logger = require('../../utils/logger');

const registerNotificationsHandlers = (bot) => {
  // Listen for "Notifications" menu button
  bot.hears([/📢 Notifications/, /📢 Уведомления/, /📢 Bildirishnomalar/], async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get('/notifications');
      
      if (!res.data || !res.data.success) {
        return ctx.reply('Xatolik yuz berdi. / Ошибка.');
      }
      
      const notifications = res.data.data;
      
      if (notifications.length === 0) {
        return ctx.reply(lang === 'uz' 
          ? 'Sizda yangi bildirishnomalar yo\'q.' 
          : lang === 'ru' 
            ? 'У вас нет новых уведомлений.' 
            : 'You have no new notifications.'
        );
      }
      
      let notifyText = lang === 'uz'
        ? '📢 *Sizning bildirishnomalaringiz (oxirgi 15 ta):*\n'
        : lang === 'ru'
          ? '📢 *Ваши уведомления (последние 15):*\n'
          : '📢 *Your notifications (last 15):*\n';
          
      notifications.forEach((n, idx) => {
        const dateStr = new Date(n.createdAt).toLocaleString();
        notifyText += `\n${idx + 1}. [${dateStr}] ${n.message[lang] || n.message.uz}`;
      });
      
      await ctx.replyWithMarkdown(notifyText);
    } catch (err) {
      logger.error(`Error in Notifications command: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
  });
};

module.exports = registerNotificationsHandlers;
