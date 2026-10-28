require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organization = require('../models/organization');
const Department = require('../models/department');
const Employee = require('../models/employee');
const Citizen = require('../models/citizen');
const Appeal = require('../models/appeal');
const AppealHistory = require('../models/appealHistory');
const Attachment = require('../models/attachment');
const AuditLog = require('../models/auditLog');
const logger = require('../utils/logger');

// Complete 34 Khanabad City Organizations from official document
const orgData = [
  {
    code: 'XONOBOD_HOKIMLIGI',
    name: {
      uz: 'Xonobod shahar hokimligi',
      ru: 'Хонобод шаҳар ҳокимлиги',
      en: 'Khonabad City Khokimiyat'
    },
    departments: [
      { uz: 'Tashkiliy-nazorat guruhi', ru: 'Организационно-контрольная группа', en: 'Organizational Control Group' },
      { uz: 'Devonxona va fuqarolar murojaatlari bo\'limi', ru: 'Канцелярия и отдел обращений граждан', en: 'Chancery and Citizens Appeals' }
    ]
  },
  {
    code: 'XONOBOD_TEXNIKUM_1',
    name: {
      uz: 'Xonobod shahar 1-son техникум',
      ru: 'Хонобод шаҳар 1-сон техникум',
      en: 'Khonabad Technical School No. 1'
    },
    departments: [
      { uz: 'O\'quv ishlari bo\'limi', ru: 'Учебный отдел', en: 'Academic Affairs' },
      { uz: 'Yoshlar bilan ishlash bo\'limi', ru: 'Отдел работы с молодежью', en: 'Youth Department' }
    ]
  },
  {
    code: 'XONOBOD_TEXNIKUM_2',
    name: {
      uz: 'Xonobod shahar 2-son техникум',
      ru: 'Хонобод шаҳар 2-сон техникум',
      en: 'Khonabad Technical School No. 2'
    },
    departments: [
      { uz: 'O\'quv-amaliyot bo\'limi', ru: 'Учебно-практический отдел', en: 'Practical Training Department' }
    ]
  },
  {
    code: 'XONOBOD_ADLIYA',
    name: {
      uz: 'Xonobod shahar adliya bo\'limi',
      ru: 'Хонобод шаҳар адлия бўлими',
      en: 'Khonabad Department of Justice'
    },
    departments: [
      { uz: 'Huquqiy xizmatlar va registr', ru: 'Юридические услуги и регистр', en: 'Legal Services' },
      { uz: 'DXM (Davlat xizmatlari markazi)', ru: 'ЦГУ (Центр государственных услуг)', en: 'Public Services Center' }
    ]
  },
  {
    code: 'XONOBOD_VETERINARIYA',
    name: {
      uz: 'Xonobod shahar veterinariya bo\'limi',
      ru: 'Хонобод шаҳар ветеринария бўлими',
      en: 'Khonabad Veterinary Department'
    },
    departments: [
      { uz: 'Sanitariya-veterinariya nazorati', ru: 'Санитарно-ветеринарный надзор', en: 'Veterinary Supervision' }
    ]
  },
  {
    code: 'XONOBOD_GAZ',
    name: {
      uz: 'Xonobod shahar gaz ta\'minoti bo\'limi',
      ru: 'Хонобод шаҳар газ таъминоти бўлими',
      en: 'Khonabad Gas Supply Department'
    },
    departments: [
      { uz: 'Gaz tarmoqlari va avariya xizmati', ru: 'Газовые сети и аварийная служба', en: 'Gas Networks & Emergency' },
      { uz: 'Hisoblagichlar va billing', ru: 'Счетчики и биллинг', en: 'Meters & Billing' }
    ]
  },
  {
    code: 'XONOBOD_YOSHLAR',
    name: {
      uz: 'Xonobod shahar yoshlar ishlari bo\'limi',
      ru: 'Хонобод шаҳар ёшлар ишлари бўлими',
      en: 'Khonabad Youth Affairs Department'
    },
    departments: [
      { uz: 'Yoshlar tashabbuslari va loyihalar', ru: 'Молодежные инициативы и проекты', en: 'Youth Initiatives' }
    ]
  },
  {
    code: 'XONOBOD_IJTIMOIY_HIMOYA',
    name: {
      uz: 'Xonobod shahar ijtimoiy himoya bo\'limi',
      ru: 'Хонобод шаҳар ижтимоий ҳимоя бўлими',
      en: 'Khonabad Social Protection Department'
    },
    departments: [
      { uz: 'Inson ijtimoiy xizmatlar markazi', ru: 'Центр социальных услуг Инсон', en: 'Inson Social Center' }
    ]
  },
  {
    code: 'XONOBOD_IIB',
    name: {
      uz: 'Xonobod shahar ichki ishlar bo\'limi (IIB)',
      ru: 'Хонобод шаҳар ички ишлар бўлими (ИИБ)',
      en: 'Khonabad Department of Internal Affairs (IIB)'
    },
    departments: [
      { uz: 'Jamoat tartibini saqlash va profilaktika', ru: 'Охрана общественного порядка и профилактика', en: 'Public Order & Prevention' },
      { uz: 'Migratsiya va fuqarolikni rasmiylashtirish', ru: 'Миграция и оформление гражданства', en: 'Migration Services' }
    ]
  },
  {
    code: 'XONOBOD_KADASTR',
    name: {
      uz: 'Xonobod shahar kadastr bo\'limi',
      ru: 'Хонобод шаҳар кадастр бўлими',
      en: 'Khonabad Cadastre Department'
    },
    departments: [
      { uz: 'Ko\'chmas mulk kadastri va davlat ro\'yxati', ru: 'Кадастр недвижимости и госрегистрация', en: 'Real Estate Cadastre' }
    ]
  },
  {
    code: 'XONOBOD_KAMBAGALLIK',
    name: {
      uz: 'Xonobod shahar kambag\'allikni qisqartirish bo\'limi',
      ru: 'Хонобод шаҳар камбағалликни қисқартириш бўлими',
      en: 'Khonabad Poverty Reduction Department'
    },
    departments: [
      { uz: 'Bandlikka ko\'maklashish va monopoliyaga qarshi', ru: 'Содействие занятости', en: 'Employment Assistance' }
    ]
  },
  {
    code: 'XONOBOD_MADANIYAT',
    name: {
      uz: 'Xonobod shahar madaniyat boshqarmasi',
      ru: 'Хонобод шаҳар маданият бошқармаси',
      en: 'Khonabad Culture Department'
    },
    departments: [
      { uz: 'Madaniyat markazlari va tadbirlar', ru: 'Центры культуры и мероприятия', en: 'Cultural Centers' }
    ]
  },
  {
    code: 'XONOBOD_MIB',
    name: {
      uz: 'Xonobod shahar majburiy ijro bürosi (MIB)',
      ru: 'Хонобод шаҳар мажбурий ижро бюроси',
      en: 'Khonabad Compulsory Enforcement Bureau (MIB)'
    },
    departments: [
      { uz: 'Sud hujjatlari va boshqa organlar hujjatlarini ijro etish', ru: 'Исполнение судебных актов', en: 'Court Judicial Enforcement' }
    ]
  },
  {
    code: 'XONOBOD_MAKTABGACHA',
    name: {
      uz: 'Xonobod shahar maktabgacha ta\'lim bo\'limi',
      ru: 'Хонобод шаҳар мактабгача таълим бўлими',
      en: 'Khonabad Preschool Education Department'
    },
    departments: [
      { uz: 'DMTT larni muvofiqlashtirish va nazorat', ru: 'Координация ДОО', en: 'Preschool Coordination' }
    ]
  },
  {
    code: 'XONOBOD_MAHALLA',
    name: {
      uz: 'Xonobod shahar mahalla uyushmasi',
      ru: 'Хонобод шаҳар маҳалла уюшмаси',
      en: 'Khonabad Mahalla Association'
    },
    departments: [
      { uz: 'Mahallalar bilan ishlash va hokim yordamchilari', ru: 'Работа с махаЛлями и помощники хокима', en: 'Mahallas & Khokim Assistants' }
    ]
  },
  {
    code: 'XONOBOD_MANAVIYAT',
    name: {
      uz: 'Xonobod shahar ma\'naviyat va ma\'rifat bo\'limi',
      ru: 'Хонобод шаҳар маънавият ва маърифат бўлими',
      en: 'Khonabad Department of Spirituality and Enlightenment'
    },
    departments: [
      { uz: 'Ma\'naviy-ma\'rifiy targ\'ibot', ru: 'Духовно-просветительская пропаганда', en: 'Enlightenment Promotion' }
    ]
  },
  {
    code: 'XONOBOD_MUDOFAA',
    name: {
      uz: 'Xonobod shahar Mudofaa bo\'limi',
      ru: 'Хонобод шаҳар Мудофаа бўлими',
      en: 'Khonabad Defense Department'
    },
    departments: [
      { uz: 'Chaqiruv va harbiy hisob', ru: 'Призыв и воинский учет', en: 'Military Conscription & Accounting' }
    ]
  },
  {
    code: 'XONOBOD_PROKURATURA',
    name: {
      uz: 'Xonobod shahar prokuraturasi',
      ru: 'Хонобод шаҳар прокуратураси',
      en: 'Khonabad City Prosecutor\'s Office'
    },
    departments: [
      { uz: 'Qonunchilik ijrosi ustidan nazorat', ru: 'Надзор за исполнением законов', en: 'Legal Supervision' }
    ]
  },
  {
    code: 'XONOBOD_SES',
    name: {
      uz: 'Xonobod shahar sanitariya-epidemiologiya bo\'limi (SES)',
      ru: 'Хонобод шаҳар санитария-эпидемиология бўлими (СЭС)',
      en: 'Khonabad Sanitary-Epidemiological Department (SES)'
    },
    departments: [
      { uz: 'Epidemiologik monitoring va sanitariya nazorati', ru: 'Эпидемиологический мониторинг', en: 'Sanitary Supervision' }
    ]
  },
  {
    code: 'XONOBOD_SOLIQ',
    name: {
      uz: 'Xonobod shahar soliq inspektsiyasi',
      ru: 'Хонобод шаҳар солиқ инспекцияси',
      en: 'Khonabad Tax Inspection'
    },
    departments: [
      { uz: 'Jismoniy va yuridik shaxslarga xizmat ko\'rsatish', ru: 'Обслуживание плательщиков', en: 'Taxpayer Services' }
    ]
  },
  {
    code: 'XONOBOD_SPORT',
    name: {
      uz: 'Xonobod shahar sport boshqarmasi',
      ru: 'Хонобод шаҳар спорт бошқармаси',
      en: 'Khonabad Sport Department'
    },
    departments: [
      { uz: 'Ommaviy sport va inshootlar', ru: 'Массовый спорт', en: 'Public Sports' }
    ]
  },
  {
    code: 'XONOBOD_SUV',
    name: {
      uz: 'Xonobod shahar suv ta\'minoti bo\'limi',
      ru: 'Хонобод шаҳар сув таъминоти бўлими',
      en: 'Khonabad Water Supply Department'
    },
    departments: [
      { uz: 'Ichimlik suvi va kanalizatsiya tarmoqlari', ru: 'Сети питьевой воды и канализации', en: 'Drinking Water & Sewerage' }
    ]
  },
  {
    code: 'XONOBOD_TTB',
    name: {
      uz: 'Xonobod shahar tibbiyot birlashmasi (TTB)',
      ru: 'Хонобод шаҳар туман тиббиёт бирлашмаси (ТТБ)',
      en: 'Khonabad Medical Association (TTB)'
    },
    departments: [
      { uz: 'Shoshilinch tibbiy yordam va poliklinikalar', ru: 'Скорая помощь и поликлиники', en: 'Emergency Medical & Clinics' }
    ]
  },
  {
    code: 'XONOBOD_UZSQB',
    name: {
      uz: 'Xonobod shahar "O\'zsanoatqurilishbank"',
      ru: 'Хонобод шаҳар «Ўзсаноатқурилишбанк»',
      en: 'Khonabad Uzpromstroybank'
    },
    departments: [
      { uz: 'Mijozlarga xizmat ko\'rsatish va kreditlash', ru: 'Обслуживание клиентов и кредитование', en: 'Customer Service & Loans' }
    ]
  },
  {
    code: 'XONOBOD_UY_JOY',
    name: {
      uz: 'Xonobod shahar uy-joy kommunal xizmat bo\'limi',
      ru: 'Хонобод шаҳар уй-жой коммунал хизмат бўлими',
      en: 'Khonabad Housing and Communal Services Department'
    },
    departments: [
      { uz: 'Ko\'p kvartirali uylar va obodonlashtirish', ru: 'Многоквартирные дома и благоустройство', en: 'Housing Maintenance' }
    ]
  },
  {
    code: 'XONOBOD_FVB',
    name: {
      uz: 'Xonobod shahar favqulodda vaziyatlar bo\'limi',
      ru: 'Хонобод шаҳар фавқулодда вазиятлар бўлими',
      en: 'Khonabad Emergency Situations Department'
    },
    departments: [
      { uz: "Yong'in xavfsizligi va qutqaruv otryadi", ru: 'Пожарная безопасность и спасатели', en: 'Fire Safety & Rescue Squad' }
    ]
  },
  {
    code: 'XONOBOD_XALQ_BANKI',
    name: {
      uz: 'Xonobod shahar Xalq banki',
      ru: 'Хонобод шаҳар Халқ банки',
      en: 'Khonabad People\'s Bank'
    },
    departments: [
      { uz: 'Pensiya, nafaqa va bank xizmatlari', ru: 'Пенсии, пособия и банковские услуги', en: 'Pensions & Retail Banking' }
    ]
  },
  {
    code: 'XONOBOD_XOTIN_QIZLAR',
    name: {
      uz: 'Xonobod shahar xotin-qizlar qo\'mitasi',
      ru: 'Хонобод шаҳар хотин-қизлар қўмитаси',
      en: 'Khonabad Women\'s Committee'
    },
    departments: [
      { uz: 'Xotin-qizlarni qo\'llab-quvvatlash va manzilli yordam', ru: 'Поддержка женщин', en: 'Women\'s Support' }
    ]
  },
  {
    code: 'XONOBOD_HOKIM_YOSHLAR_URINBOSAR',
    name: {
      uz: "Xonobod shahar hokimining yoshlar siyosati, ijtimoiy rivojlantirish va ma'naviy ma'rifiy ishlar bo'yicha o'rinbosari",
      ru: 'Хонобод шаҳар ҳокимининг ёшлар сиёсати, ижтимоий ривожлантириш ва маънавий маърифий ишлар бўйича ўринбосари',
      en: 'Khonabad Deputy Khokim for Youth Policy & Social Development'
    },
    departments: [
      { uz: 'Yoshlar siyosati va ijtimoiy masalalar kotibiyati', ru: 'Секретариат по молодежной политике', en: 'Youth Policy Secretariat' }
    ]
  },
  {
    code: 'XONOBOD_HOKIM_QURILISH_URINBOSAR',
    name: {
      uz: "Xonobod shahar hokimining qurilish, to'siqsiz muhit yaratish, kommunikatsiyalar, kommunal xo'jalik, ekologiya va ko'kalamzorlashtirish masalalari bo'yicha o'rinbosari",
      ru: 'Хонобод шаҳар ҳокимининг қурилиш тўсиқсиз муҳит яратиш коммуникациялар, комунал хўжалик, экология ва кўкаламзорлаштириш масалалари бўйича ўринбосари',
      en: 'Khonabad Deputy Khokim for Construction & Utilities'
    },
    departments: [
      { uz: 'Qurilish, kommunal va ekologiya kotibiyati', ru: 'Секретариат по строительства и ЖКХ', en: 'Construction Secretariat' }
    ]
  },
  {
    code: 'XONOBOD_HOKIM_MOLIYA_BIRINCHI_URINBOSAR',
    name: {
      uz: "Xonobod shahar hokimining moliya - iqtisodiyot va kambag'allikni qisqartirish masalalari bo'yicha birinchi o'rinbosari",
      ru: 'Хонобод шаҳар ҳокимининг молия - иқтисодиёт ва камбағалликни қисқартириш масалалари бўйича биринчи ўринбосари',
      en: 'Khonabad First Deputy Khokim for Finance & Economy'
    },
    departments: [
      { uz: 'Moliya-iqtisodiyot va investitsiyalar kotibiyati', ru: 'Секретариат по финансам и экономике', en: 'Financial Secretariat' }
    ]
  },
  {
    code: 'XONOBOD_HOKIM_INVESTITSIYA_URINBOSAR',
    name: {
      uz: "Xonobod shahar hokimining o'rinbosari - investitsiyalar va tashqi savdo bo'limi boshlig'i",
      ru: 'Хонобод шаҳар ҳокимининг ўринбосари-инвестициялар ва ташқи савдо бўлими бошлиғи',
      en: 'Khonabad Deputy Khokim for Investment & Foreign Trade'
    },
    departments: [
      { uz: "Investitsiyalar va eksportni rag'batlantirish bo'limi", ru: 'Отдел инвестиций и экспорта', en: 'Investment & Export Department' }
    ]
  },
  {
    code: 'XONOBOD_EKOLOGIYA',
    name: {
      uz: 'Xonobod shahar Ekologiya bo\'limi',
      ru: 'Хонобод шаҳар Экология',
      en: 'Khonabad Ecology Department'
    },
    departments: [
      { uz: 'Atrof-muhitni muhofaza qilish va atrof nazorati', ru: 'Охрана окружающей среды', en: 'Environmental Protection' }
    ]
  },
  {
    code: 'XONOBOD_ELEKTR',
    name: {
      uz: 'Xonobod shahar elektr tarmoqlari bo\'limi',
      ru: 'Хонобод шаҳар электр тармоқлари бўлими',
      en: 'Khonabad Electric Grid Department'
    },
    departments: [
      { uz: 'Elektr tarmoqlari, dispetcherlik va billing', ru: 'Электросети, диспетчерская и биллинг', en: 'Electric Networks & Dispatching' }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Seeding database started...');

    // Clear existing data
    await Organization.deleteMany({});
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Citizen.deleteMany({});
    await Appeal.deleteMany({});
    await AppealHistory.deleteMany({});
    await Attachment.deleteMany({});
    await AuditLog.deleteMany({});
    logger.info('Cleaned database collections.');

    // Seed organizations and departments
    const createdOrgs = [];
    for (const orgInfo of orgData) {
      const org = await Organization.create({
        code: orgInfo.code,
        name: orgInfo.name
      });
      createdOrgs.push(org);

      const createdDeps = [];
      for (const depInfo of orgInfo.departments) {
        const dep = await Department.create({
          organization: org._id,
          name: depInfo
        });
        createdDeps.push(dep);
      }
      logger.info(`Seeded Organization: ${org.name.uz} with ${createdDeps.length} departments.`);
    }

    // Map credentials for all 34 organizations
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
      XONOBOD_KADASTR: { username: 'kadastr_admin', password: 'Kadastr#2026!', fullName: 'Кадастр бўлими масъули' },
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

    const salt = await bcrypt.genSalt(10);
    const orgAdminsMap = {};

    // Create unique login credentials for EACH organization
    for (const org of createdOrgs) {
      const cred = orgCredentials[org.code] || {
        username: `${org.code.toLowerCase()}_admin`,
        password: `${org.code.toLowerCase()}#2026!`,
        fullName: `${org.name.uz} mas'uli`
      };

      const orgHashedPassword = await bcrypt.hash(cred.password, salt);
      const defaultDep = await Department.findOne({ organization: org._id });

      const employeeAccount = await Employee.create({
        username: cred.username,
        password: orgHashedPassword,
        fullName: cred.fullName,
        role: 'Organization Admin',
        organization: org._id,
        department: defaultDep ? defaultDep._id : undefined
      });

      orgAdminsMap[org.code] = employeeAccount;
      logger.info(`Seeded Org Account [${org.name.uz}]: username=${cred.username}, password=${cred.password}`);
    }

    // Seed Global Super Admin
    const defaultOrg = createdOrgs[0]; // Khonabad City Khokimiyat
    const defaultDep = await Department.findOne({ organization: defaultOrg._id });
    const superAdminHash = await bcrypt.hash('admin123', salt);

    const admin = await Employee.create({
      username: 'admin',
      password: superAdminHash,
      fullName: 'Sirojiddin Alimov (Super Admin)',
      role: 'Super Admin',
      organization: defaultOrg._id,
      department: defaultDep._id
    });
    logger.info(`Seeded Super Admin: admin (password: admin123)`);

    // Seed Agency Inspector (Government Oversight)
    const inspector = await Employee.create({
      username: 'inspector',
      password: superAdminHash,
      fullName: 'Farrux Rahimov (Agency Inspector)',
      role: 'Agency Inspector',
      organization: defaultOrg._id,
      department: defaultDep._id
    });
    logger.info(`Seeded Agency Inspector: inspector (password: admin123)`);

    // Seed sample citizens
    const citizen1 = await Citizen.create({
      telegramId: 99887766,
      firstName: 'Javohir',
      lastName: 'Ergashev',
      username: 'j_ergashev',
      phone: '+998 90 123 45 67',
      language: 'uz'
    });

    const citizen2 = await Citizen.create({
      telegramId: 88776655,
      firstName: 'Dilnoza',
      lastName: 'Usmonova',
      username: 'd_usmonova',
      phone: '+998 93 987 65 43',
      language: 'uz'
    });

    // -------------------------------------------------------------------
    // SEED APPEALS SPECIFICALLY ROUTED TO MATCHING ORGANIZATIONS
    // -------------------------------------------------------------------

    // 1. GAZ TA'MINOTI BO'LIMI (XONOBOD_GAZ) - Specific appeals for Gas Department
    const gasOrg = createdOrgs.find(o => o.code === 'XONOBOD_GAZ');
    const gasDep = await Department.findOne({ organization: gasOrg._id });
    const gasAdmin = orgAdminsMap['XONOBOD_GAZ'];

    // 1a. Gas: Yangi kelgan murojaat (Received)
    await Appeal.create({
      appealNumber: 'APL-2026-000103',
      citizen: citizen1._id,
      organization: gasOrg._id,
      department: gasDep._id,
      category: 'Gaz ta\'minoti',
      subject: 'Xonobod shahar Navro\'z MFY gaz bosimi juda pastligi',
      description: 'Navro\'z MFY, Yoshlik ko\'chasi 45-uy atrofidagi 12 ta xonadonda tabiiy gaz bosimi juda pasayib ketgan, isitish qozonlari o\'chib qolyapti. Gaz ta\'minoti xodimlari kelib bosimni rostlab berishlarini so\'raymiz.',
      status: 'Received',
      priority: 'High',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000)
    });

    // 1b. Gas: Ijro jarayonida (In Progress)
    await Appeal.create({
      appealNumber: 'APL-2026-000104',
      citizen: citizen2._id,
      organization: gasOrg._id,
      department: gasDep._id,
      category: 'Gaz hisoblagich',
      subject: 'Mustaqillik ko\'chasida zamonaviy gaz hisoblagich o\'rnatish',
      description: 'Mustaqillik ko\'chasi 18-uyda yangi elektron gaz hisoblagichni davlat tekshiruvidan o\'tkazish va qayta tamg\'alash bo\'yicha ariza.',
      status: 'In Progress',
      priority: 'Medium',
      assignedEmployee: gasAdmin._id,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000)
    });

    // 1c. Gas: Ijro hisoboti topshirilgan (Execution Submitted - waiting Agency Review)
    await Appeal.create({
      appealNumber: 'APL-2026-000105',
      citizen: citizen1._id,
      organization: gasOrg._id,
      department: gasDep._id,
      category: 'Gaz tarmoqlari ta\'miri',
      subject: 'Xonobod markaziy ko\'chasida gaz quvuri nosozligi bartaraf etildi',
      description: 'Markaziy ko\'cha bo\'ylab o\'tgan o\'rta bosimli gaz quvuridagi nosozlik to\'g\'risida murojaat.',
      status: 'Execution Submitted',
      priority: 'Urgent',
      assignedEmployee: gasAdmin._id,
      executionReport: {
        text: 'Gaz ta\'minoti brigadasi tomonidan 150 metr masofadagi gaz quvuri ko\'rikdan o\'tkazildi, vtulka va kranlar yangisiga almashtirildi, bosim me\'yorga keltirildi.',
        submittedAt: new Date(Date.now() - 4 * 3600 * 1000)
      },
      createdAt: new Date(Date.now() - 48 * 3600 * 1000)
    });

    // 1d. Gas: Bajarilgan (Completed)
    await Appeal.create({
      appealNumber: 'APL-2026-000106',
      citizen: citizen2._id,
      organization: gasOrg._id,
      department: gasDep._id,
      category: 'Gaz ta\'minoti',
      subject: 'Yangiobod mahallasidagi gaz ta\'minoti tiklandi',
      description: 'Profilaktika ishlaridan so\'ng gaz berish kechikyapti.',
      status: 'Completed',
      priority: 'Low',
      assignedEmployee: gasAdmin._id,
      executionReport: {
        text: 'Rejali ta\'mirlash yakunlandi va gaz tarmog\'iga to\'liq uzatildi.',
        submittedAt: new Date(Date.now() - 72 * 3600 * 1000)
      },
      rating: {
        score: 5,
        problemSolved: true,
        employeeBehavior: 5,
        responseQuality: 5,
        speed: 5,
        comment: 'Tez va sifatli hal qilindi, rahmat!'
      },
      createdAt: new Date(Date.now() - 96 * 3600 * 1000)
    });

    // 2. ELEKTR TARMOQLARI BO'LIMI (XONOBOD_ELEKTR)
    const elektrOrg = createdOrgs.find(o => o.code === 'XONOBOD_ELEKTR');
    const elektrDep = await Department.findOne({ organization: elektrOrg._id });
    const elektrAdmin = orgAdminsMap['XONOBOD_ELEKTR'];

    await Appeal.create({
      appealNumber: 'APL-2026-000102',
      citizen: citizen1._id,
      organization: elektrOrg._id,
      department: elektrDep._id,
      category: 'Elektr ta\'minoti',
      subject: 'Xonobod shahar elektr kuchlanishi pastligi',
      description: 'Xonobod shahar mahallasida elektr kuchlanishi 160V ga tushib ketmoqda.',
      status: 'Objection',
      priority: 'Urgent',
      assignedEmployee: elektrAdmin._id,
      objection: {
        reason: 'Elektr ta\'minoti baribir barqaror emas, transformatorda ortiqcha yuklama bor!',
        status: 'Under Review',
        submittedAt: new Date()
      },
      createdAt: new Date(Date.now() - 36 * 3600 * 1000)
    });

    await Appeal.create({
      appealNumber: 'APL-2026-000107',
      citizen: citizen2._id,
      organization: elektrOrg._id,
      department: elektrDep._id,
      category: 'Elektr simlari',
      subject: 'Yangi ko\'chada elektr tayanch ustuni qulash xavfi',
      description: 'Kuchli shamol oqibatida beton simyog\'och og\'ib qolgan.',
      status: 'Received',
      priority: 'Urgent',
      createdAt: new Date(Date.now() - 1 * 3600 * 1000)
    });

    // 3. SUV TA'MINOTI BO'LIMI (XONOBOD_SUV)
    const suvOrg = createdOrgs.find(o => o.code === 'XONOBOD_SUV');
    const suvDep = await Department.findOne({ organization: suvOrg._id });
    const suvAdmin = orgAdminsMap['XONOBOD_SUV'];

    await Appeal.create({
      appealNumber: 'APL-2026-000108',
      citizen: citizen1._id,
      organization: suvOrg._id,
      department: suvDep._id,
      category: 'Ichimlik suvi',
      subject: 'Xonobod shahar Bo\'ston ko\'chasida toza ichimlik suvi bosimi pastligi',
      description: 'Uchinchi qavatgacha ichimlik suvi yetib chiqmayapti.',
      status: 'Received',
      priority: 'Medium',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000)
    });

    // 4. HOKIMLIK (XONOBOD_HOKIMLIGI)
    const hokimOrg = createdOrgs.find(o => o.code === 'XONOBOD_HOKIMLIGI');
    const hokimDep = await Department.findOne({ organization: hokimOrg._id });
    const hokimAdmin = orgAdminsMap['XONOBOD_HOKIMLIGI'];

    const appeal1 = await Appeal.create({
      appealNumber: 'APL-2026-000101',
      citizen: citizen1._id,
      organization: hokimOrg._id,
      department: hokimDep._id,
      category: 'Hokimiyat masalalari',
      subject: 'Xonobod shahar hokimligiga infratuzilma bo\'yicha murojaat',
      description: "Xonobod shahri markaziy ko'chasida tungi yoritish chiroqlari va yo'l infratuzilmasini yaxshilash so'raladi.",
      status: 'Execution Submitted',
      priority: 'High',
      assignedEmployee: hokimAdmin._id,
      executionReport: {
        text: 'Tungi yoritish chiroqlari almashtirildi va hudud ko\'zdan kechirildi.',
        submittedAt: new Date()
      },
      createdAt: new Date(Date.now() - 40 * 3600 * 1000)
    });

    // 5. ICHKI ISHLAR BO'LIMI (XONOBOD_IIB)
    const iibOrg = createdOrgs.find(o => o.code === 'XONOBOD_IIB');
    const iibDep = await Department.findOne({ organization: iibOrg._id });
    await Appeal.create({
      appealNumber: 'APL-2026-000109',
      citizen: citizen2._id,
      organization: iibOrg._id,
      department: iibDep._id,
      category: 'Jamoat tartibi',
      subject: 'Markaziy xiyobonda jamoat tartibini kuchaytirish',
      description: 'Tungi vaqtlarda xiyobonda patrul xizmatini yo\'lga qo\'yish so\'raladi.',
      status: 'Received',
      priority: 'Medium',
      createdAt: new Date(Date.now() - 10 * 3600 * 1000)
    });

    // Seed Audit Log entries
    await AuditLog.create({
      action: 'APPEAL_REGISTERED',
      actorName: 'Javohir Ergashev',
      actorRole: 'Citizen',
      appealId: appeal1._id,
      appealNumber: appeal1.appealNumber,
      newState: 'Received',
      details: { channel: 'Telegram Bot' }
    });

    await AuditLog.create({
      action: 'SYSTEM_SEEDED',
      actorName: 'System Seeder',
      actorRole: 'System',
      newState: 'Initialized',
      details: { organizationsCount: createdOrgs.length, accountsCreated: Object.keys(orgCredentials).length + 2 }
    });

    logger.info('================================================================');
    logger.info(`SUCCESS: Database seeded with ${createdOrgs.length} Khanabad organizations!`);
    logger.info(`SUCCESS: ${Object.keys(orgCredentials).length} individual organization accounts created.`);
    logger.info('Gas Department admin: username=gaz_admin, password=Gaz#2026!');
    logger.info('Electric Department admin: username=elektr_admin, password=Elektr#2026!');
    logger.info('Super Admin: username=admin, password=admin123');
    logger.info('Agency Inspector: username=inspector, password=admin123');
    logger.info('================================================================');

    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
