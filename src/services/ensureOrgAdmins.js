const bcrypt = require('bcryptjs');
const Organization = require('../models/organization');
const Department = require('../models/department');
const Employee = require('../models/employee');
const { orgData } = require('../config/orgData');
const logger = require('../utils/logger');

const orgCredentials = {
  XONOBOD_HOKIMLIGI: { username: 'hokimiyat_admin', password: 'Hokim#2026!', fullName: 'Хонобод шаҳар ҳокимлиги масъули' },
  XONOBOD_TEXNIKUM_1: { username: 'texnikum1_admin', password: 'Texnik1#2026!', fullName: '1-сон техникум масъули' },
  XONOBOD_TEXNIKUM_2: { username: 'texnikum2_admin', password: 'Texnik2#2026!', fullName: '2-сон техникум масъули' },
  XONOBOD_ADLIYA: { username: 'adliya_admin', password: 'Adliya#2026!', fullName: 'Адлия бўлими масъули' },
  XONOBOD_VETERINARIYA: { username: 'veterinariya_admin', password: 'Vet#2026!', fullName: 'Ветеринария бўлими масъули' },
  XONOBOD_GAZ: { username: 'gaz_admin', password: 'Gaz#2026!', fullName: 'Хонобод шаҳар газ таъминоти бўлими масъули' },
  XONOBOD_YOSHLAR: { username: 'yoshlar_admin', password: 'Yoshlar#2026!', fullName: 'Ёшлар ишлари бўлими масъули' },
  XONOBOD_IJTIMOIY_HIMOYA: { username: 'ijtimoiy_admin', password: 'Ijtimoiy#2026!', fullName: 'Ижтимоий ҳимоя бўлими масъули' },
  XONOBOD_IIB: { username: 'iib_admin', password: 'IIB#2026!', fullName: 'Ички ишлар бўлими (ИИБ) масъули' },
  XONOBOD_KADASTR: { username: 'kadastr_admin', password: 'Kadastr#2026!', fullName: 'Кадастр бўлими масъуli' },
  XONOBOD_KAMBAGALLIK: { username: 'kambagallik_admin', password: 'Kambagal#2026!', fullName: 'Камбағалликни қисқартириш бўлими масъули' },
  XONOBOD_MADANIYAT: { username: 'madaniyat_admin', password: 'Madaniyat#2026!', fullName: 'Маданият бошқармаси масъули' },
  XONOBOD_MIB: { username: 'mib_admin', password: 'MIB#2026!', fullName: 'Мажбурий ижро бюроси (МИБ) масъули' },
  XONOBOD_MAKTABGACHA: { username: 'maktabgacha_admin', password: 'Bogcha#2026!', fullName: 'Мактабгача таълим бўлими масъули' },
  XONOBOD_MAHALLA: { username: 'mahalla_admin', password: 'Mahalla#2026!', fullName: 'Маҳалла уюшмаси масъули' },
  XONOBOD_MANAVIYAT: { username: 'manaviyat_admin', password: 'Manaviyat#2026!', fullName: 'Маънавият ва маърифат бўлими масъули' },
  XONOBOD_MUDOFAA: { username: 'mudofaa_admin', password: 'Mudofaa#2026!', fullName: 'Мудофаа бўлими масъули' },
  XONOBOD_PROKURATURA: { username: 'prokuratura_admin', password: 'Prokuror#2026!', fullName: 'Прокуратура масъули' },
  XONOBOD_SES: { username: 'ses_admin', password: 'SES#2026!', fullName: 'СЭС бўлими масъули' },
  XONOBOD_SOLIQ: { username: 'soliq_admin', password: 'Soliq#2026!', fullName: 'Солиқ инспекцияси масъули' },
  XONOBOD_SPORT: { username: 'sport_admin', password: 'Sport#2026!', fullName: 'Спорт бошқармаси масъули' },
  XONOBOD_SUV: { username: 'suv_admin', password: 'Suv#2026!', fullName: 'Сув таъминоти бўлими масъули' },
  XONOBOD_TTB: { username: 'ttb_admin', password: 'TTB#2026!', fullName: 'Туман тиббиёт бирлашмаси (ТТБ) масъули' },
  XONOBOD_UZSQB: { username: 'uzsqb_admin', password: 'Uzsqb#2026!', fullName: '«Ўзсаноатқурилишбанк» масъули' },
  XONOBOD_UY_JOY: { username: 'uy_joy_admin', password: 'UyJoy#2026!', fullName: 'Уй-жой коммунал хизмат бўлими масъули' },
  XONOBOD_FVB: { username: 'fvb_admin', password: 'FVB#2026!', fullName: 'Фавқулодда вазиятлар бўлими (ФВБ) масъули' },
  XONOBOD_XALQ_BANKI: { username: 'xalq_banki_admin', password: 'XalqBank#2026!', fullName: 'Халқ банки масъули' },
  XONOBOD_XOTIN_QIZLAR: { username: 'xotin_qizlar_admin', password: 'Ayollar#2026!', fullName: 'Хотин-қизлар қўмитаси масъули' },
  XONOBOD_HOKIM_YOSHLAR_URINBOSAR: { username: 'hokim_yoshlar_admin', password: 'HokimYosh#2026!', fullName: 'Ҳокимнинг ёшлар сиёсати бўйича ўринбосари котибияти' },
  XONOBOD_HOKIM_QURILISH_URINBOSAR: { username: 'hokim_qurilish_admin', password: 'HokimQur#2026!', fullName: 'Ҳокимнинг қурилиш ва коммунал бўйича ўринбосари котибияти' },
  XONOBOD_HOKIM_MOLIYA_BIRINCHI_URINBOSAR: { username: 'hokim_moliya_admin', password: 'HokimMol#2026!', fullName: 'Ҳокимнинг молия бўйича 1-ўринбосари котибияти' },
  XONOBOD_HOKIM_INVESTITSIYA_URINBOSAR: { username: 'hokim_invest_admin', password: 'HokimInv#2026!', fullName: 'Ҳокимнинг инвестициялар бўйича ўринбосари котибияти' },
  XONOBOD_EKOLOGIYA: { username: 'ekologiya_admin', password: 'Ekologiya#2026!', fullName: 'Экология бўлими масъули' },
  XONOBOD_ELEKTR: { username: 'elektr_admin', password: 'Elektr#2026!', fullName: 'Электр тармоқлари бўлими масъули' }
};

const ensureOrgAdmins = async () => {
  try {
    const salt = await bcrypt.genSalt(10);

    // 1. Ensure all 34 Organizations and Departments exist
    for (const item of orgData) {
      let orgDoc = await Organization.findOne({ code: item.code });
      if (!orgDoc) {
        orgDoc = await Organization.create({
          code: item.code,
          name: item.name
        });
      }

      for (const dep of item.departments) {
        const depExists = await Department.findOne({
          organization: orgDoc._id,
          'name.uz': dep.uz
        });
        if (!depExists) {
          await Department.create({
            name: dep,
            organization: orgDoc._id
          });
        }
      }
    }

    // 2. Ensure each organization has its dedicated admin account
    let createdCount = 0;
    let updatedCount = 0;

    for (const [code, cred] of Object.entries(orgCredentials)) {
      const orgDoc = await Organization.findOne({ code });
      if (!orgDoc) continue;

      const defaultDep = await Department.findOne({ organization: orgDoc._id });
      const depId = defaultDep ? defaultDep._id : undefined;

      const existingEmployee = await Employee.findOne({ username: cred.username });

      if (!existingEmployee) {
        const hashedPassword = await bcrypt.hash(cred.password, salt);
        await Employee.create({
          username: cred.username,
          password: hashedPassword,
          fullName: cred.fullName,
          role: 'Organization Admin',
          organization: orgDoc._id,
          department: depId
        });
        createdCount++;
      } else {
        const needsOrgUpdate = !existingEmployee.organization || existingEmployee.organization.toString() !== orgDoc._id.toString();
        if (needsOrgUpdate) {
          existingEmployee.organization = orgDoc._id;
          if (depId && !existingEmployee.department) existingEmployee.department = depId;
          await existingEmployee.save();
          updatedCount++;
        }
      }
    }

    // 3. Ensure Super Admin (admin / admin123) exists
    const superAdmin = await Employee.findOne({ username: 'admin' });
    if (!superAdmin) {
      const defaultOrg = await Organization.findOne({ code: 'XONOBOD_HOKIMLIGI' });
      const hashedAdminPassword = await bcrypt.hash('admin123', salt);
      await Employee.create({
        username: 'admin',
        password: hashedAdminPassword,
        fullName: 'Тизим бош админи',
        role: 'Super Admin',
        organization: defaultOrg ? defaultOrg._id : undefined
      });
      logger.info('Super Admin account created: admin');
    }

    // 4. Ensure Agency Inspector (inspector / inspector123) exists
    const inspector = await Employee.findOne({ username: 'inspector' });
    if (!inspector) {
      const defaultOrg = await Organization.findOne({ code: 'XONOBOD_HOKIMLIGI' });
      const hashedInspectorPassword = await bcrypt.hash('inspector123', salt);
      await Employee.create({
        username: 'inspector',
        password: hashedInspectorPassword,
        fullName: 'Агентлик назоратчи инспектори',
        role: 'Agency Inspector',
        organization: defaultOrg ? defaultOrg._id : undefined
      });
      logger.info('Agency Inspector account created: inspector');
    }

    logger.info(`Organizations and Credentials sync completed: ${createdCount} created, ${updatedCount} updated.`);
  } catch (error) {
    logger.error(`Error in ensureOrgAdmins: ${error.message}`);
  }
};

module.exports = { ensureOrgAdmins, orgCredentials };
