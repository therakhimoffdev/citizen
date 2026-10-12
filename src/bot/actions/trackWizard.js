const { Scenes, Markup } = require('telegraf');
const { WizardScene } = Scenes;
const getApiClient = require('../utils/apiClient');
const { getLocale, getStatusBadge } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');
const logger = require('../../utils/logger');

const trackWizard = new WizardScene(
  'track_wizard',
  // Step 1: Prompt number
  async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      await ctx.reply(loc.trackPrompt, Markup.keyboard([[loc.btnCancel]]).resize());
      return ctx.wizard.next();
    } catch (err) {
      logger.error(`Track Wizard start error: ${err.message}`);
      return ctx.scene.leave();
    }
  },
  
  // Step 2: Handle input and search
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (!text) return;
    if (text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    try {
      await ctx.reply('Qidirilmoqda... / Поиск...');
      
      const client = getApiClient(ctx.session.token);
      const res = await client.get(`/appeals/search?appealNumber=${encodeURIComponent(text.trim())}`);
      
      if (res.data && res.data.success) {
        const appeal = res.data.data;
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
          
        await ctx.replyWithMarkdown(detailsText, getMainMenuKeyboard(lang));
      } else {
        await ctx.reply(loc.trackNotFound, getMainMenuKeyboard(lang));
      }
    } catch (err) {
      logger.error(`Error tracking appeal: ${err.message}`);
      await ctx.reply(loc.trackNotFound, getMainMenuKeyboard(lang));
    }
    return ctx.scene.leave();
  }
);

module.exports = trackWizard;
