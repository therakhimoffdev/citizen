const { Scenes, Markup } = require('telegraf');
const { WizardScene } = Scenes;
const FormData = require('form-data');
const axios = require('axios');
const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');
const logger = require('../../utils/logger');

const objectionWizard = new WizardScene(
  'objection_wizard',
  // Step 1: Prompt reason
  async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      // Store target appeal ID from scene options
      ctx.wizard.state.appealId = ctx.scene.state.appealId;
      ctx.wizard.state.objectionData = { reason: '', attachments: [] };
      
      await ctx.reply(loc.objectionPrompt, Markup.keyboard([[loc.btnCancel]]).resize());
      return ctx.wizard.next();
    } catch (err) {
      logger.error(`Objection Wizard start error: ${err.message}`);
      return ctx.scene.leave();
    }
  },
  
  // Step 2: Handle reason input, prompt files
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (!text) return;
    if (text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    ctx.wizard.state.objectionData.reason = text;
    
    await ctx.reply(
      loc.stepUploadFiles,
      Markup.keyboard([[loc.btnSubmit], [loc.btnCancel]]).resize()
    );
    return ctx.wizard.next();
  },
  
  // Step 3: Handle file uploads (evidence), submit objection
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    if (text === loc.btnSubmit) {
      try {
        await ctx.reply('E\'tiroz yuborilmoqda... / Отправка возражения...');
        
        const client = getApiClient(ctx.session.token);
        const { appealId, objectionData } = ctx.wizard.state;
        
        const response = await client.post(`/appeals/${appealId}/object`, {
          reason: objectionData.reason,
          attachments: objectionData.attachments
        });
        
        if (response.data && response.data.success) {
          await ctx.reply(loc.objectionSubmitted, getMainMenuKeyboard(lang));
        } else {
          await ctx.reply('E\'tiroz yuborishda xatolik yuz berdi.', getMainMenuKeyboard(lang));
        }
      } catch (err) {
        logger.error(`Error submitting objection: ${err.message}`);
        await ctx.reply('E\'tiroz yuborishda xatolik yuz berdi.', getMainMenuKeyboard(lang));
      }
      return ctx.scene.leave();
    }
    
    // Process files if sent
    let fileId;
    let originalName = 'file';
    
    if (ctx.message?.photo) {
      const photos = ctx.message.photo;
      fileId = photos[photos.length - 1].file_id;
      originalName = `evidence_${fileId.substring(0, 8)}.jpg`;
    } else if (ctx.message?.document) {
      fileId = ctx.message.document.file_id;
      originalName = ctx.message.document.file_name || 'evidence';
    }
    
    if (fileId) {
      try {
        await ctx.reply('Fayl yuklanmoqda... / Файл загружается...');
        const fileLinkObj = await ctx.telegram.getFileLink(fileId);
        const fileLink = fileLinkObj.href;
        
        const fileBufferRes = await axios.get(fileLink, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(fileBufferRes.data);
        
        const form = new FormData();
        form.append('file', fileBuffer, originalName);
        form.append('fileId', fileId);
        
        const uploadRes = await axios.post(
          `${process.env.API_URL || 'http://localhost:5000/api'}/files/upload`,
          form,
          {
            headers: {
              ...form.getHeaders(),
              'Authorization': `Bearer ${ctx.session.token}`
            }
          }
        );
        
        if (uploadRes.data && uploadRes.data.success) {
          ctx.wizard.state.objectionData.attachments.push(uploadRes.data.data._id);
          await ctx.reply(`✅ Muvaffaqiyatli yuklandi: ${originalName}`);
        } else {
          await ctx.reply('⚠️ Yuklashda xatolik yuz berdi.');
        }
      } catch (err) {
        logger.error(`Error uploading objection file: ${err.message}`);
        await ctx.reply('⚠️ Yuklashda xatolik yuz berdi.');
      }
    } else {
      await ctx.reply('Iltimos, rasm yoki hujjat yuboring yoki "Yuborish" tugmasini bosing.');
    }
  }
);

module.exports = objectionWizard;
