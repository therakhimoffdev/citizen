const { Markup } = require('telegraf');
const FormData = require('form-data');
const axios = require('axios');
const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');
const logger = require('../../utils/logger');

const registerMessagingHandlers = (bot) => {
  // Listen for "Messages" menu button
  bot.hears([/💬 Messages/, /💬 Сообщения/, /💬 Xabarlar/], async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get('/appeals');
      
      if (!res.data || !res.data.success) {
        return ctx.reply('Xatolik yuz berdi. / Ошибка.');
      }
      
      const appeals = res.data.data.filter(apl => 
        ['Received', 'Accepted', 'Assigned', 'In Progress', 'Waiting Agency Review'].includes(apl.status)
      );
      
      if (appeals.length === 0) {
        return ctx.reply(loc.noAppeals);
      }
      
      const buttons = appeals.map(apl => [
        Markup.button.callback(`${apl.appealNumber} - ${apl.subject.substring(0, 20)}...`, `enter_chat_${apl._id}`)
      ]);
      
      await ctx.reply(
        'Qaysi murojaat bo\'yicha suhbatlashmoqchisiz? / Выберите обращение для чата:',
        Markup.inlineKeyboard(buttons)
      );
    } catch (err) {
      logger.error(`Error listing chats: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
  });

  // Handle enter chat via inline action
  const enterChat = async (ctx, appealId) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get(`/appeals/${appealId}`);
      
      if (!res.data || !res.data.success) {
        return ctx.reply('Murojaatni yuklab bo\'lmadi.');
      }
      
      const appeal = res.data.data;
      ctx.session.activeChatAppealId = appeal._id;
      ctx.session.activeChatNumber = appeal.appealNumber;
      
      const headerText = loc.appealChatTitle.replace('{num}', appeal.appealNumber);
      
      await ctx.reply(
        headerText,
        Markup.keyboard([
          ['❌ Exit Chat / Chiqish / Выход']
        ]).resize()
      );
      
      // Fetch and print last 10 messages
      const msgRes = await client.get(`/messages/appeal/${appealId}`);
      if (msgRes.data && msgRes.data.success && msgRes.data.data.length > 0) {
        const messages = msgRes.data.data.slice(-10); // last 10 messages
        let historyStr = '💬 *Oxirgi xabarlar / Последние сообщения:*\n';
        messages.forEach(m => {
          const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          historyStr += `\n*[${time}] ${m.sender.name} (${m.sender.role}):* ${m.text}`;
        });
        await ctx.replyWithMarkdown(historyStr);
      }
    } catch (err) {
      logger.error(`Error entering chat: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
  };

  bot.action(/^chat_apl_(.+)$/, (ctx) => enterChat(ctx, ctx.match[1]));
  bot.action(/^enter_chat_(.+)$/, (ctx) => enterChat(ctx, ctx.match[1]));

  // Exit chat
  bot.hears([/Exit Chat/, /Chiqish/, /Выход/], async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    
    ctx.session.activeChatAppealId = null;
    ctx.session.activeChatNumber = null;
    
    await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
  });

  // Catch-all message handler for active chat mode
  bot.on(['message', 'photo', 'document'], async (ctx, next) => {
    if (!ctx.session || !ctx.session.activeChatAppealId) {
      return next(); // Pass to other commands/menu triggers
    }
    
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    
    const text = ctx.message.text;
    if (text && (text.includes('Exit Chat') || text.includes('Chiqish') || text.includes('Выход') || text.startsWith('/'))) {
      return next();
    }
    
    // Send message to Express API
    try {
      const appealId = ctx.session.activeChatAppealId;
      const attachments = [];
      
      let fileId;
      let originalName = 'file';
      
      if (ctx.message.photo) {
        const photos = ctx.message.photo;
        fileId = photos[photos.length - 1].file_id;
        originalName = `chat_${fileId.substring(0, 8)}.jpg`;
      } else if (ctx.message.document) {
        fileId = ctx.message.document.file_id;
        originalName = ctx.message.document.file_name || 'chat_doc';
      }
      
      if (fileId) {
        // Upload file first
        const fileLinkObj = await ctx.telegram.getFileLink(fileId);
        const fileLink = fileLinkObj.href;
        
        const fileBufferRes = await axios.get(fileLink, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(fileBufferRes.data);
        
        const form = new FormData();
        form.append('file', fileBuffer, originalName);
        form.append('fileId', fileId);
        
        const uploadRes = await axios.post(
          `${getApiClient.getBaseApiUrl()}/files/upload`,
          form,
          {
            headers: {
              ...form.getHeaders(),
              'Authorization': `Bearer ${ctx.session.token}`
            }
          }
        );
        
        if (uploadRes.data && uploadRes.data.success) {
          attachments.push(uploadRes.data.data._id);
        }
      }
      
      const client = getApiClient(ctx.session.token);
      await client.post('/messages', {
        appealId,
        text: text || '',
        attachments
      });
      
      await ctx.reply(`✅ Xabar yuborildi / Отправлено`);
    } catch (err) {
      logger.error(`Error sending chat message: ${err.message}`);
      await ctx.reply('⚠️ Xabar yuborib bo\'lmadi. Qaytadan urinib ko\'ring.');
    }
  });
};

module.exports = registerMessagingHandlers;
