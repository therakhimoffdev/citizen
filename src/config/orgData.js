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

module.exports = { orgData };
