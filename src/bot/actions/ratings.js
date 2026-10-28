const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const logger = require('../../utils/logger');

const registerRatingsHandlers = (bot) => {
  // Listen for "My Ratings" menu button
  bot.hears([/⭐ My Ratings/, /⭐ Мои оценки/, /⭐ Mening reytinglarim/], async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get('/appeals');
      
      if (!res.data || !res.data.success) {
        return ctx.reply('Xatolik yuz berdi. / Ошибка.');
      }
      
      const ratedAppeals = res.data.data.filter(apl => apl.rating !== null);
      
      if (ratedAppeals.length === 0) {
        return ctx.reply(lang === 'uz' 
          ? 'Siz hali baholagan murojaatlar yo\'q.' 
          : lang === 'ru' 
            ? 'У вас еще нет оцененных обращений.' 
            : 'You have no rated appeals yet.'
        );
      }
      
      let ratingsText = lang === 'uz'
        ? '⭐ *Sizning baholaringiz:*\n'
        : lang === 'ru'
          ? '⭐ *Ваши оценки:*\n'
          : '⭐ *Your ratings:*\n';
          
      ratedAppeals.forEach((apl, idx) => {
        const rate = apl.rating;
        ratingsText += `\n${idx + 1}. *Murojaat:* ${apl.appealNumber}`;
        ratingsText += `\n   *Umumiy baho:* ${'⭐'.repeat(rate.score)}`;
        ratingsText += `\n   *Muammo yechildi:* ${rate.problemSolved ? 'Ha' : 'Yo\'q'}`;
        ratingsText += `\n   *Xodim muomalasi:* ${rate.employeeBehavior}/5, *Javob sifati:* ${rate.responseQuality}/5, *Tezkorlik:* ${rate.speed}/5`;
        if (rate.comment) {
          ratingsText += `\n   *Fikr:* _"${rate.comment}"_`;
        }
        ratingsText += '\n';
      });
      
      await ctx.replyWithMarkdown(ratingsText);
    } catch (err) {
      logger.error(`Error in My Ratings command: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
  });

  // Action callback hooks to trigger Rating and Objection scenes (supports rate_apl_... and rate_...)
  bot.action(/^rate(?:_apl)?_(.+)$/, async (ctx) => {
    try {
      const appealId = ctx.match[1];
      await ctx.answerCbQuery();
      await ctx.scene.enter('rating_wizard', { appealId });
    } catch (err) {
      logger.error(`Error entering rating wizard: ${err.message}`);
    }
  });

  bot.action(/^object(?:_apl)?_(.+)$/, async (ctx) => {
    try {
      const appealId = ctx.match[1];
      await ctx.answerCbQuery();
      await ctx.scene.enter('objection_wizard', { appealId });
    } catch (err) {
      logger.error(`Error entering objection wizard: ${err.message}`);
    }
  });
};

module.exports = registerRatingsHandlers;
