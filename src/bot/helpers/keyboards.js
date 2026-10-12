const { Markup } = require('telegraf');
const { getLocale } = require('./locale');

const getMainMenuKeyboard = (lang) => {
  const loc = getLocale(lang);
  return Markup.keyboard([
    [loc.btnNewAppeal, loc.btnMyAppeals],
    [loc.btnTrackAppeal, loc.btnMessages],
    [loc.btnNotifications, loc.btnRatings],
    [loc.btnSettings, loc.btnHelp]
  ]).resize();
};

const getSettingsKeyboard = (lang) => {
  const loc = getLocale(lang);
  return Markup.keyboard([
    [loc.btnLang, loc.btnPhone],
    [loc.btnDeleteAcc],
    [loc.btnBack]
  ]).resize();
};

const getLanguageKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Oʻzbekcha 🇺🇿', 'set_lang_uz')],
    [Markup.button.callback('Русский 🇷🇺', 'set_lang_ru')],
    [Markup.button.callback('English 🇬🇧', 'set_lang_en')]
  ]);
};

module.exports = {
  getMainMenuKeyboard,
  getSettingsKeyboard,
  getLanguageKeyboard
};
