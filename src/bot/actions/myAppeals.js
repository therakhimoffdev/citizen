const { Markup } = require('telegraf');
const getApiClient = require('../utils/apiClient');
const { getLocale, getStatusBadge } = require('../helpers/locale');
const logger = require('../../utils/logger');

const registerMyAppealsHandlers = (bot) => {
  // Listen for "My Appeals" menu button
  bot.hears([/📂 My Appeals/, /📂 Мои обращения/, /📂 Murojaatlarim/], async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get('/appeals');
      
      if (!res.data || !res.data.success) {
        return ctx.reply('Murojaatlarni yuklashda xatolik. / Ошибка загрузки обращений.');
      }
      
      const appeals = res.data.data;
      if (appeals.length === 0) {
        return ctx.reply(loc.noAppeals);
      }
      
      await ctx.reply(loc.myAppealsTitle);
      
      for (const apl of appeals) {
        const dateStr = new Date(apl.createdAt).toLocaleDateString();
        const statusBadge = getStatusBadge(apl.status, lang);
        const orgName = apl.organization?.name[lang] || apl.organization?.name.uz || 'N/A';
        
        const cardText = loc.appealCard
          .replace('{num}', apl.appealNumber)
          .replace('{subject}', apl.subject)
          .replace('{org}', orgName)
          .replace('{status}', statusBadge)
          .replace('{date}', dateStr);
          
        const inlineButtons = [
          [
            Markup.button.callback(loc.btnView, `view_apl_${apl._id}`),
            Markup.button.callback(loc.btnMessages, `chat_apl_${apl._id}`)
          ]
        ];
        
        // If appeal is completed and rating is not filled
        if (apl.status === 'Completed') {
          if (!apl.rating) {
            inlineButtons.push([
              Markup.button.callback(loc.btnRate, `rate_apl_${apl._id}`)
            ]);
          }
          if (!apl.objection) {
            inlineButtons.push([
              Markup.button.callback(loc.btnObjection, `object_apl_${apl._id}`)
            ]);
          }
        }
        
        await ctx.replyWithMarkdown(cardText, Markup.inlineKeyboard(inlineButtons));
      }
    } catch (err) {
      logger.error(`Error in My Appeals command: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi. Qaytadan urining.');
    }
  });

  // Inline callback to view specific appeal details
  bot.action(/^view_apl_(.+)$/, async (ctx) => {
    try {
      const appealId = ctx.match[1];
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get(`/appeals/${appealId}`);
      
      if (!res.data || !res.data.success) {
        return ctx.answerCbQuery('Xatolik yuz berdi.');
      }
      
      const appeal = res.data.data;
      const history = res.data.history || [];
      const statusBadge = getStatusBadge(appeal.status, lang);
      const orgName = appeal.organization?.name[lang] || appeal.organization?.name.uz || 'N/A';
      const depName = appeal.department?.name[lang] || appeal.department?.name.uz || 'N/A';
      const employeeName = appeal.assignedEmployee?.fullName || 'N/A';
      const dateStr = new Date(appeal.createdAt).toLocaleDateString();
      
      let detailsText = loc.appealDetails
        .replace('{num}', appeal.appealNumber)
        .replace('{status}', statusBadge)
        .replace('{org}', orgName)
        .replace('{dep}', depName)
        .replace('{subject}', appeal.subject)
        .replace('{desc}', appeal.description)
        .replace('{employee}', employeeName)
        .replace('{date}', dateStr);
        
      if (!appeal.department) {
        detailsText = detailsText.replace(/📁.*?\n/, '');
      }
      if (!appeal.subject) {
        detailsText = detailsText.replace(/📝.*?\n/, '');
      }
        
      // Add history timeline to details
      if (history.length > 0) {
        detailsText += `\n\n📜 *Timeline:*`;
        history.forEach((h, idx) => {
          const hDate = new Date(h.createdAt).toLocaleString();
          const badge = getStatusBadge(h.status, lang);
          detailsText += `\n${idx + 1}. [${hDate}] ${badge} - ${h.comment}`;
        });
      }
      
      await ctx.answerCbQuery();
      await ctx.replyWithMarkdown(detailsText);
    } catch (err) {
      logger.error(`Error viewing appeal details: ${err.message}`);
      await ctx.answerCbQuery('Xatolik yuz berdi.');
    }
  });
};

module.exports = registerMyAppealsHandlers;
