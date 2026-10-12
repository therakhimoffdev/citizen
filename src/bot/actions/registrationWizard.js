const { Scenes, Markup } = require('telegraf');
const { WizardScene } = Scenes;
const getApiClient = require('../utils/apiClient');
const { getLocale } = require('../helpers/locale');
const { getMainMenuKeyboard } = require('../helpers/keyboards');
const logger = require('../../utils/logger');

const registrationWizard = new WizardScene(
  'registration_wizard',
  // Step 1: Prompt Language (using inline buttons)
  async (ctx) => {
    try {
      ctx.wizard.state.regData = {};
      
      const inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Oʻzbekcha 🇺🇿', 'reg_lang_uz')],
        [Markup.button.callback('Русский 🇷🇺', 'reg_lang_ru')],
        [Markup.button.callback('English 🇬🇧', 'reg_lang_en')]
      ]);
      
      await ctx.reply(
        'Tilni tanlang / Выберите язык / Select language:',
        inlineKeyboard
      );
      return ctx.wizard.next();
    } catch (err) {
      logger.error(`Registration wizard step 1 error: ${err.message}`);
      return ctx.scene.leave();
    }
  },
  
  // Step 2: Handle Language Selection, Wait for Callback
  async (ctx) => {
    if (ctx.message?.text) {
      await ctx.reply('Iltimos, yuqoridagi til tugmalaridan birini tanlang / Выберите язык.');
    }
  },
  
  // Step 3: Handle Name Input, Prompt Phone (if missing)
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    const text = ctx.message?.text;
    
    if (!text) {
      await ctx.reply(
        lang === 'uz' ? 'Iltimos, ism va familiyangizni matn ko\'rinishida yuboring:' :
        lang === 'ru' ? 'Пожалуйста, введите имя и фамилию в текстовом формате:' :
        'Please enter your first and last name in text format:'
      );
      return;
    }
    
    const parts = text.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    
    ctx.wizard.state.regData.firstName = firstName;
    ctx.wizard.state.regData.lastName = lastName;
    
    try {
      const client = getApiClient(ctx.session.token);
      
      // Update name
      const updateRes = await client.put('/profile', { firstName, lastName });
      const citizen = updateRes.data.profile;
      ctx.session.citizen = citizen;
      
      if (citizen && citizen.phone) {
        // Has phone number already, complete and exit
        const loc = getLocale(lang);
        await ctx.reply(
          lang === 'uz' ? "Muvaffaqiyatli ro'yxatdan o'tdingiz!" :
          lang === 'ru' ? 'Вы успешно зарегистрировались!' :
          'Successfully registered!',
          getMainMenuKeyboard(lang)
        );
        return ctx.scene.leave();
      }
      
      // Request phone number
      const phonePrompt = lang === 'uz' ? 'Telefon raqamingizni kiriting (+998911234567 ko\'rinishida) yoki quyidagi tugma orqali ulashing:' :
                          lang === 'ru' ? 'Введите ваш номер телефона (в формате +998911234567) или поделитесь им с помощью кнопки:' :
                          'Enter your phone number (in format +998911234567) or share it using the button:';
                          
      const btnSendPhone = lang === 'uz' ? '📱 Telefon raqamni yuborish' :
                           lang === 'ru' ? '📱 Отправить номер' :
                           '📱 Send Phone Number';
                           
      await ctx.reply(
        phonePrompt,
        Markup.keyboard([
          [Markup.button.contactRequest(btnSendPhone)]
        ]).resize()
      );
      
      return ctx.wizard.next();
    } catch (err) {
      logger.error(`Error saving name in registration: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi. Qayta urinib ko\'ring.');
      return ctx.scene.leave();
    }
  },
  
  // Step 4: Handle Phone Input, Save and Finish
  async (ctx) => {
    const lang = ctx.session.language || 'uz';
    let phoneNumber = '';
    
    if (ctx.message?.contact) {
      phoneNumber = ctx.message.contact.phone_number;
    } else if (ctx.message?.text) {
      const typed = ctx.message.text.trim();
      const phoneRegex = /^\+998\d{9}$/;
      if (!phoneRegex.test(typed)) {
        const invalidMsg = lang === 'uz' ? 'Telefon raqami noto\'g\'ri shaklda kiritildi. Iltimos, +998911234567 ko\'rinishida qayta kiriting:' :
                           lang === 'ru' ? 'Неверный формат номера. Пожалуйста, введите в формате +998911234567:' :
                           'Invalid phone number format. Please enter in format +998911234567:';
        await ctx.reply(invalidMsg);
        return;
      }
      phoneNumber = typed;
    } else {
      await ctx.reply('Iltimos, telefon raqamingizni yuboring.');
      return;
    }
    
    try {
      const client = getApiClient(ctx.session.token);
      const response = await client.put('/profile', { phone: phoneNumber });
      
      if (response.data && response.data.success) {
        ctx.session.citizen = response.data.profile;
        
        await ctx.reply(
          lang === 'uz' ? 'Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!' :
          lang === 'ru' ? 'Регистрация успешно завершена!' :
          'Registration completed successfully!',
          getMainMenuKeyboard(lang)
        );
      } else {
        await ctx.reply('Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    } catch (err) {
      logger.error(`Error saving phone in registration: ${err.message}`);
      await ctx.reply('Xatolik yuz berdi.');
    }
    return ctx.scene.leave();
  }
);

// Register inline action callbacks inside the wizard scene
const handleRegLangChange = async (ctx, selectedLang) => {
  try {
    ctx.session.language = selectedLang;
    
    // Update language via API
    const client = getApiClient(ctx.session.token);
    const response = await client.put('/profile', { language: selectedLang });
    
    if (response.data && response.data.success) {
      ctx.session.citizen = response.data.profile;
    }
    
    await ctx.answerCbQuery();
    
    // Prompt for Name
    const promptName = selectedLang === 'uz' ? 'Ism va familiyangizni kiriting (masalan: Dilshod Karimov):' :
                       selectedLang === 'ru' ? 'Введите ваши имя и фамилию (например: Дильшод Каримов):' :
                       'Enter your first and last name (e.g., Dilshod Karimov):';
                       
    await ctx.reply(promptName, Markup.removeKeyboard());
    return ctx.wizard.selectStep(2); // Jump to name input step
  } catch (err) {
    logger.error(`Error changing language in registration: ${err.message}`);
    await ctx.reply('Xatolik yuz berdi.');
  }
};

// Listeners for inline language buttons
registrationWizard.action('reg_lang_uz', (ctx) => handleRegLangChange(ctx, 'uz'));
registrationWizard.action('reg_lang_ru', (ctx) => handleRegLangChange(ctx, 'ru'));
registrationWizard.action('reg_lang_en', (ctx) => handleRegLangChange(ctx, 'en'));

module.exports = registrationWizard;
