const { Markup } = require('telegraf');
const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard, getSettingsKeyboard, getLanguageKeyboard } = require('../helpers/keyboards');
const getApiClient = require('../utils/apiClient');
const logger = require('../../utils/logger');

const registerSettingsHandlers = (bot) => {
  // Show settings menu
  bot.hears([/⚙ Settings/, /⚙ Настройки/, /⚙ Sozlamalar/], async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    await ctx.reply(loc.settingsTitle, getSettingsKeyboard(lang));
  });

  // Back button
  bot.hears([/⬅ Orqaga/, /⬅ Назад/, /⬅ Back/], async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
  });

  // Language selection trigger
  bot.hears([/🌐 Tilni o'zgartirish/, /🌐 Сменить язык/, /🌐 Change Language/], async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    await ctx.reply(loc.langSelect, getLanguageKeyboard());
  });

  // Inline language callbacks
  const handleLangChange = async (ctx, selectedLang) => {
    try {
      ctx.session.language = selectedLang;
      
      // Update language in DB via API
      const client = getApiClient(ctx.session.token);
      const response = await client.put('/profile', { language: selectedLang });
      
      if (response.data && response.data.success) {
        ctx.session.citizen = response.data.profile;
      }
      
      const loc = getLocale(selectedLang);
      await ctx.answerCbQuery(loc.langChanged);
      await ctx.reply(loc.langChanged, getMainMenuKeyboard(selectedLang));
    } catch (err) {
      logger.error(`Error changing language: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi. / Произошла ошибка. / An error occurred.');
    }
  };

  bot.action('set_lang_uz', (ctx) => handleLangChange(ctx, 'uz'));
  bot.action('set_lang_ru', (ctx) => handleLangChange(ctx, 'ru'));
  bot.action('set_lang_en', (ctx) => handleLangChange(ctx, 'en'));

  // Update phone prompt
  bot.hears([/📱 Telefon raqamni yangilash/, /📱 Обновить номер телефона/, /📱 Update Phone Number/], async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    await ctx.reply(
      loc.phonePrompt,
      Markup.keyboard([
        [Markup.button.contactRequest(loc.btnSendPhone)],
        [loc.btnBack]
      ]).resize()
    );
  });

  // Handle contact share
  bot.on('contact', async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      const phoneNumber = ctx.message.contact.phone_number;
      
      // Update phone via API
      const client = getApiClient(ctx.session.token);
      const response = await client.put('/profile', { phone: phoneNumber });
      
      if (response.data && response.data.success) {
        ctx.session.citizen = response.data.profile;
        await ctx.reply(loc.phoneUpdated, getMainMenuKeyboard(lang));
      } else {
        await ctx.reply('Xatolik yuz berdi. Qaytadan urining.');
      }
    } catch (err) {
      logger.error(`Error saving phone number: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
  });

  // Account deletion request
  bot.hears([/❌ Akkauntni o'chirish/, /❌ Удалить аккаунт/, /❌ Delete Account/], async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const client = getApiClient(ctx.session.token);
      const response = await client.delete('/profile');
      
      if (response.data && response.data.success) {
        await ctx.reply(response.data.message, getMainMenuKeyboard(lang));
      } else {
        await ctx.reply('Xatolik yuz berdi.');
      }
    } catch (err) {
      logger.error(`Error deleting account: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
  });
};

module.exports = registerSettingsHandlers;
