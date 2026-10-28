const getApiClient = require('../utils/apiClient');
const logger = require('../../utils/logger');

const checkAuth = async (ctx, next) => {
  if (!ctx.session) {
    ctx.session = {};
  }
  
  if (ctx.from) {
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username || '';
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    
    let needAuth = !ctx.session.token;
    
    // Verify existing token
    if (ctx.session.token) {
      try {
        const client = getApiClient(ctx.session.token);
        const profileRes = await client.get('/profile');
        if (profileRes.data && profileRes.data.success) {
          ctx.session.citizen = profileRes.data.profile;
          ctx.session.language = profileRes.data.profile.language;
        } else {
          needAuth = true;
        }
      } catch (err) {
        logger.warn(`Stale or invalid token detected for ${telegramId}, re-authenticating...`);
        needAuth = true;
      }
    }
    
    // Authenticate if needed
    if (needAuth) {
      try {
        const client = getApiClient();
        const response = await client.post('/auth/telegram', {
          telegramId,
          username,
          firstName,
          lastName,
          language: ctx.session.language || 'uz'
        });
        
        if (response.data && response.data.success) {
          ctx.session.token = response.data.token;
          ctx.session.citizen = response.data.citizen;
          ctx.session.language = response.data.citizen.language;
          logger.info(`Bot authenticated user ${telegramId} successfully.`);
        } else {
          logger.error(`API authentication returned failure for ${telegramId}: ${JSON.stringify(response.data)}`);
          return ctx.reply('Tizimga ulanishda xatolik yuz berdi. Iltimos keyinroq qayta urining. / Ошибка подключения к системе. Попробуйте позже.');
        }
      } catch (authErr) {
        logger.error(`Bot auth request error for ${telegramId}: ${authErr.message} (status: ${authErr.response?.status}, data: ${JSON.stringify(authErr.response?.data)})`);
        return ctx.reply('Tizimga ulanishda xatolik yuz berdi. Iltimos keyinroq qayta urining. / Ошибка подключения к системе. Попробуйте позже.');
      }
    }
  }
  
  return await next();
};

module.exports = checkAuth;
