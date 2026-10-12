const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');

const startHandler = async (ctx) => {
  const citizen = ctx.session.citizen;
  
  // Profile is complete if they have language and a phone number
  const isComplete = ctx.session.language && citizen && citizen.phone;
  
  if (!isComplete) {
    return ctx.scene.enter('registration_wizard');
  }
  
  const lang = ctx.session.language || citizen.language || 'uz';
  const loc = getLocale(lang);
  
  await ctx.reply(
    `${loc.welcome}\n\n${loc.mainMenuTitle}`,
    getMainMenuKeyboard(lang)
  );
};

module.exports = startHandler;
