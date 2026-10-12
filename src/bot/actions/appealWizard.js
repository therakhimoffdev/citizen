const { Scenes, Markup } = require('telegraf');
const { WizardScene } = Scenes;
const FormData = require('form-data');
const axios = require('axios');
const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');
const logger = require('../../utils/logger');

// Helper to fetch organizations
const fetchOrganizations = async (token) => {
  try {
    const client = getApiClient(token);
    const res = await client.get('/appeals/organizations');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    logger.error(`Error fetching organizations: ${err.message}`);
    return [];
  }
};

const appealWizard = new WizardScene(
  'new_appeal_wizard',
  // Step 1: Choose Organization
  async (ctx) => {
    try {
      const lang = ctx.session.language || 'uz';
      const loc = getLocale(lang);
      
      const orgs = await fetchOrganizations(ctx.session.token);
      ctx.wizard.state.organizations = orgs;
      ctx.wizard.state.appealData = { attachments: [] };
      
      if (orgs.length === 0) {
        await ctx.reply('Xatolik yuz berdi. Tashkilotlarni yuklab bo\'lmadi. Qayta urinib ko\'ring.');
        return ctx.scene.leave();
      }
      
      const buttons = orgs.map(org => [org.name[lang] || org.name.uz]);
      buttons.push([loc.btnCancel]);
      
      await ctx.reply(loc.stepChooseOrg, Markup.keyboard(buttons).resize());
      return ctx.wizard.next();
    } catch (err) {
      logger.error(`Appeal step 1 error: ${err.message}`);
      return ctx.scene.leave();
    }
  },
  
  // Step 2: Handle Organization Selection, Prompt Description Matni (No Subject, No Category, No Department)
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (!text) return;
    
    if (text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    const orgs = ctx.wizard.state.organizations || [];
    
    // Exact match find
    const selectedOrg = orgs.find(org => (org.name[lang] || org.name.uz) === text);
    
    if (!selectedOrg) {
      // Treat text as search query
      const filtered = orgs.filter(org => 
        (org.name[lang] || org.name.uz).toLowerCase().includes(text.toLowerCase())
      );
      
      if (filtered.length > 0) {
        const buttons = filtered.map(org => [org.name[lang] || org.name.uz]);
        buttons.push([loc.btnCancel]);
        await ctx.reply(loc.stepChooseOrg, Markup.keyboard(buttons).resize());
      } else {
        await ctx.reply('Hech narsa topilmadi. Qaytadan kiriting / Ничего не найдено. Введите заново:');
      }
      return; // Stay on this step
    }
    
    ctx.wizard.state.appealData.organizationId = selectedOrg._id;
    ctx.wizard.state.appealData.organizationName = selectedOrg.name[lang] || selectedOrg.name.uz;
    
    // Prompt directly for description text
    await ctx.reply(loc.stepEnterDesc, Markup.keyboard([[loc.btnCancel]]).resize());
    return ctx.wizard.next();
  },
  
  // Step 3: Handle Description Input, Prompt File Uploads
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (!text) return;
    if (text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    if (text.length > 5000) {
      await ctx.reply('Murojaat matni 5000 ta belgidan oshmasligi kerak / Текст не должен превышать 5000 символов:');
      return;
    }
    
    ctx.wizard.state.appealData.description = text;
    
    await ctx.reply(
      loc.stepUploadFiles,
      Markup.keyboard([[loc.btnNext], [loc.btnCancel]]).resize()
    );
    return ctx.wizard.next();
  },
  
  // Step 4: Handle File Uploads, Prompt Location
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    
    // Check if next button is pressed
    if (ctx.message?.text === loc.btnNext) {
      await ctx.reply(
        loc.stepShareLocation,
        Markup.keyboard([
          [Markup.button.locationRequest(loc.stepShareLocation.split('\n')[0])],
          [loc.btnSkip, loc.btnCancel]
        ]).resize()
      );
      return ctx.wizard.next();
    }
    
    if (ctx.message?.text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    // Check for attachments sent
    let fileId;
    let fileType;
    let originalName = 'file';
    
    if (ctx.message?.photo) {
      const photos = ctx.message.photo;
      fileId = photos[photos.length - 1].file_id;
      fileType = 'photo';
      originalName = `photo_${fileId.substring(0, 8)}.jpg`;
    } else if (ctx.message?.document) {
      fileId = ctx.message.document.file_id;
      fileType = 'document';
      originalName = ctx.message.document.file_name || 'document';
    } else if (ctx.message?.video) {
      fileId = ctx.message.video.file_id;
      fileType = 'video';
      originalName = `video_${fileId.substring(0, 8)}.mp4`;
    } else if (ctx.message?.voice) {
      fileId = ctx.message.voice.file_id;
      fileType = 'voice';
      originalName = `voice_${fileId.substring(0, 8)}.ogg`;
    } else if (ctx.message?.audio) {
      fileId = ctx.message.audio.file_id;
      fileType = 'audio';
      originalName = ctx.message.audio.file_name || 'audio.mp3';
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
          ctx.wizard.state.appealData.attachments.push(uploadRes.data.data._id);
          await ctx.reply(`✅ Muvaffaqiyatli yuklandi: ${originalName}`);
        } else {
          await ctx.reply('⚠️ Yuklashda xatolik yuz berdi.');
        }
      } catch (err) {
        logger.error(`Error uploading Telegram file: ${err.message}`);
        await ctx.reply('⚠️ Faylni yuklab bo\'lmadi.');
      }
    } else {
      await ctx.reply('Iltimos, fayl yuboring yoki "Keyingi" tugmasini bosing.');
    }
  },
  
  // Step 5: Handle Location Share, Show Preview
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    
    if (ctx.message?.text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    if (ctx.message?.location) {
      ctx.wizard.state.appealData.location = {
        latitude: ctx.message.location.latitude,
        longitude: ctx.message.location.longitude
      };
    }
    
    const data = ctx.wizard.state.appealData;
    const locString = data.location 
      ? `Latitude: ${data.location.latitude}, Longitude: ${data.location.longitude}`
      : 'No';
      
    // Format preview text, removing department, category, and subject lines
    let previewText = loc.stepPreview
      .replace('{org}', data.organizationName)
      .replace('{desc}', data.description)
      .replace('{filesCount}', data.attachments.length)
      .replace('{location}', locString);
      
    // Remove lines for department, category, and subject from preview dynamically
    previewText = previewText
      .replace(/📁.*?\n/, '')
      .replace(/🏷.*?\n/, '')
      .replace(/📝.*?\n/, '');
      
    await ctx.reply(
      previewText,
      Markup.keyboard([
        [loc.btnSubmit],
        [loc.btnEdit, loc.btnCancel]
      ]).resize()
    );
    return ctx.wizard.next();
  },
  
  // Step 6: Handle Final Submission
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const loc = getLocale(lang);
    const text = ctx.message?.text;
    
    if (!text) return;
    
    if (text === loc.btnCancel) {
      await ctx.reply(loc.mainMenuTitle, getMainMenuKeyboard(lang));
      return ctx.scene.leave();
    }
    
    if (text === loc.btnEdit) {
      await ctx.reply('Tahrirlash: Murojaatni qaytadan yaratish boshlandi.');
      return ctx.scene.enter('new_appeal_wizard');
    }
    
    if (text === loc.btnSubmit) {
      try {
        await ctx.reply('Murojaat yuborilmoqda... / Отправка обращения...');
        
        const client = getApiClient(ctx.session.token);
        const data = ctx.wizard.state.appealData;
        
        const response = await client.post('/appeals', {
          organizationId: data.organizationId,
          description: data.description,
          attachments: data.attachments,
          location: data.location
        });
        
        if (response.data && response.data.success) {
          const appeal = response.data.data;
          const successMsg = loc.appealSubmitted.replace('{num}', appeal.appealNumber);
          await ctx.replyWithMarkdown(successMsg, getMainMenuKeyboard(lang));
        } else {
          await ctx.reply(loc.appealSubmitFailed, getMainMenuKeyboard(lang));
        }
      } catch (err) {
        logger.error(`Error submitting appeal: ${err.message}`);
        await ctx.reply(loc.appealSubmitFailed, getMainMenuKeyboard(lang));
      }
      return ctx.scene.leave();
    }
    
    await ctx.reply('Iltimos, quyidagi tugmalardan foydalaning:');
  }
);

module.exports = appealWizard;
