const { Scenes, Markup } = require('telegraf');
const { WizardScene } = Scenes;
const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');
const logger = require('../../utils/logger');

const getRatingKeyboard = () => {
  return Markup.keyboard([
    ['1', '2', '3', '4', '5'],
    ['Cancel']
  ]).resize();
};

const ratingWizard = new WizardScene(
  'rating_wizard',
  // Step 1: Ask for Overall Score
  async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      ctx.wizard.state.appealId = ctx.scene.state.appealId;
      ctx.wizard.state.ratingData = {};
      
      await ctx.reply(
        loc.rateScorePrompt,
        getRatingKeyboard()
      );
      return ctx.wizard.next();
    } catch (err) {
      logger.error(`Rating Wizard start error: ${err.message}`);
      return ctx.scene.leave();
    }
  },
  
  // Step 2: Handle Score, Ask Problem Solved
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === 'Cancel') {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    const score = parseInt(text);
    if (isNaN(score) || score < 1 || score > 5) {
      await ctx.reply('Iltimos, 1 dan 5 gacha baholang / Выберите от 1 до 5:');
      return;
    }
    
    ctx.wizard.state.ratingData.score = score;
    
    await ctx.reply(
      loc.rateSolvedPrompt,
      Markup.keyboard([
        [loc.btnYes, loc.btnNo],
        ['Cancel']
      ]).resize()
    );
    return ctx.wizard.next();
  },
  
  // Step 3: Handle Problem Solved, Ask Employee Behavior
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === 'Cancel') {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    if (text !== loc.btnYes && text !== loc.btnNo) {
      await ctx.reply('Iltimos, Ha yoki Yo\'q tanlang / Выберите Да или Нет:');
      return;
    }
    
    ctx.wizard.state.ratingData.problemSolved = (text === loc.btnYes);
    
    await ctx.reply(
      loc.rateBehaviorPrompt,
      getRatingKeyboard()
    );
    return ctx.wizard.next();
  },
  
  // Step 4: Handle Employee Behavior, Ask Response Quality
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === 'Cancel') {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    const rating = parseInt(text);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      await ctx.reply('Iltimos, 1 dan 5 gacha baholang / Выберите от 1 до 5:');
      return;
    }
    
    ctx.wizard.state.ratingData.employeeBehavior = rating;
    
    await ctx.reply(
      loc.rateQualityPrompt,
      getRatingKeyboard()
    );
    return ctx.wizard.next();
  },
  
  // Step 5: Handle Response Quality, Ask Speed
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === 'Cancel') {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    const rating = parseInt(text);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      await ctx.reply('Iltimos, 1 dan 5 gacha baholang / Выберите от 1 до 5:');
      return;
    }
    
    ctx.wizard.state.ratingData.responseQuality = rating;
    
    await ctx.reply(
      loc.rateSpeedPrompt,
      getRatingKeyboard()
    );
    return ctx.wizard.next();
  },
  
  // Step 6: Handle Speed, Ask Additional Comment
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === 'Cancel') {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    const rating = parseInt(text);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      await ctx.reply('Iltimos, 1 dan 5 gacha baholang / Выберите от 1 до 5:');
      return;
    }
    
    ctx.wizard.state.ratingData.speed = rating;
    
    await ctx.reply(
      loc.rateCommentPrompt,
      Markup.keyboard([
        [loc.btnSkip],
        ['Cancel']
      ]).resize()
    );
    return ctx.wizard.next();
  },
  
  // Step 7: Handle Comment, Submit Rating
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === 'Cancel') {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    const comment = (text === loc.btnSkip) ? '' : text;
    
    try {
      await ctx.reply('Baholash saqlanmoqda... / Сохранение оценки...');
      
      const client = getApiClient(ctx.session.token);
      const { appealId, ratingData } = ctx.wizard.state;
      
      const response = await client.post(`/appeals/${appealId}/rate`, {
        score: ratingData.score,
        problemSolved: ratingData.problemSolved,
        employeeBehavior: ratingData.employeeBehavior,
        responseQuality: ratingData.responseQuality,
        speed: ratingData.speed,
        comment
      });
      
      if (response.data && response.data.success) {
        await ctx.reply(loc.rateCompleted, getMainMenuKeyboard(lang));
      } else {
        await ctx.reply('Baholashda xatolik yuz berdi.', getMainMenuKeyboard(lang));
      }
    } catch (err) {
      logger.error(`Error saving rating: ${err.message}`);
      await ctx.reply('Baholashda xatolik yuz berdi.', getMainMenuKeyboard(lang));
    }
    return ctx.scene.leave();
  }
);

module.exports = ratingWizard;
