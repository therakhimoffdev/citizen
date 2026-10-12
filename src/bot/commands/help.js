const { getLocale } = require('../helpers/locale');

const helpHandler = async (ctx) => {
  const lang = ctx.session.language || 'uz';
  const loc = getLocale(lang);
  
  await ctx.replyWithMarkdown(loc.helpText, {
    disable_web_page_preview: true
  });
};

module.exports = helpHandler;
