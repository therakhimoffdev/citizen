const locales = {
  uz: {
    welcome: "Assalomu alaykum, Davlat Murojaatlar Tizimiga xush kelibsiz!",
    registered: "Siz muvaffaqiyatli roʻyxatdan oʻtdingiz.",
    mainMenuTitle: "Quyidagi xizmatlardan birini tanlang:",
    btnNewAppeal: "📨 Yangi murojaat",
    btnMyAppeals: "📂 Murojaatlarim",
    btnTrackAppeal: "🔎 Murojaatni tekshirish",
    btnMessages: "💬 Xabarlar",
    btnNotifications: "📢 Bildirishnomalar",
    btnRatings: "⭐ Mening reytinglarim",
    btnSettings: "⚙ Sozlamalar",
    btnHelp: "❓ Yordam",
    
    settingsTitle: "Sozlamalarni o'zgartirish:",
    btnLang: "🌐 Tilni o'zgartirish",
    btnPhone: "📱 Telefon raqamni yangilash",
    btnDeleteAcc: "❌ Akkauntni o'chirish",
    btnBack: "⬅ Orqaga",
    btnCancel: "❌ Bekor qilish",
    
    phonePrompt: "Telefon raqamingizni yuboring (tugmani bosing):",
    btnSendPhone: "📱 Telefon raqamni yuborish",
    phoneUpdated: "Raqamingiz muvaffaqiyatli saqlandi!",
    
    helpText: "🏛 *Davlat Murojaatlar Tizimi*\n\nUshbu bot orqali davlat tashkilotlariga rasmiy murojaat yo'llashingiz mumkin.\n\n📞 Ishonch telefoni: 1148\n🌐 Veb-sayt: [portal.gov.uz](https://portal.gov.uz)\n🕒 Ish vaqti: Dush-Jum, 9:00 - 18:00\n\n_Murojaatingiz qonun doirasida ko'rib chiqiladi._",
    
    // Appeal creation wizard translation
    stepChooseOrg: "1/5. Tashkilotni tanlang:\n(Qidirish uchun tashkilot nomini yozib yuborishingiz mumkin)",
    stepChooseDep: "Bo'limni tanlang:",
    stepChooseCat: "Murojaat toifasini tanlang:",
    stepEnterSubject: "Murojaat mavzusini kiriting (maksimal 150 ta belgi):",
    stepEnterDesc: "2/5. Murojaat matnini kiriting (maksimal 5000 ta belgi):",
    stepUploadFiles: "3/5. Murojaatga fayllarni biriktiring (rasm, video, hujjatlar). Yuklab bo'lgach 'Keyingi' tugmasini bosing:",
    btnNext: "➡️ Keyingi",
    stepShareLocation: "4/5. Murojaat joylashuvini ulashing (ixtiyoriy, GPS):",
    btnSkip: "⏭ O'tkazib yuborish",
    stepPreview: "5/5. Murojaatni tasdiqlang:\n\n🏢 Tashkilot: {org}\n📁 Bo'lim: {dep}\n🏷 Toifa: {cat}\n📝 Mavzu: {subject}\n\n📄 Matn: {desc}\n📎 Fayllar soni: {filesCount}\n📍 Joylashuv: {location}",
    btnSubmit: "✅ Yuborish",
    btnEdit: "✏️ Tahrirlash",
    
    appealSubmitted: "Murojaat muvaffaqiyatli yuborildi!\n\n🔢 Murojaat raqami: *{num}*\nStatus: *Yuborildi*",
    appealSubmitFailed: "Murojaat yuborishda xatolik yuz berdi. Iltimos qaytadan urining.",
    
    // My appeals list
    myAppealsTitle: "Sizning murojaatlaringiz:",
    appealCard: "🔢 *Raqam:* {num}\n📝 *Mavzu:* {subject}\n🏢 *Tashkilot:* {org}\n🚦 *Status:* {status}\n📅 *Sana:* {date}",
    noAppeals: "Sizda hozircha murojaatlar yo'q.",
    btnView: "👁 Ko'rish",
    
    // Status translation
    statusReceived: "📥 Qabul qilindi",
    statusAccepted: "✅ Ma'qullandi",
    statusAssigned: "👤 Biriktirildi",
    statusInProgress: "⚙ Ko'rib chiqilmoqda",
    statusWaitingReview: "🔎 Tekshirilmoqda",
    statusCompleted: "🎉 Yakunlandi",
    statusRejected: "❌ Rad etildi",
    statusReturned: "↩ Qaytarildi",
    statusClosed: "🔒 Yopildi",
    
    // Appeal details screen
    appealDetails: "📋 *Murojaat Ma'lumotlari*\n\n🔢 Raqam: {num}\n🚦 Status: {status}\n🏢 Tashkilot: {org}\n📁 Bo'lim: {dep}\n📝 Mavzu: {subject}\n📄 Matn: {desc}\n\n👤 Mas'ul: {employee}\n📅 Sana: {date}",
    btnObjection: "⚠️ E'tiroz bildirish",
    btnRate: "⭐ Baholash",
    btnDownloadReport: "📥 Hisobotni yuklash",
    
    // Objection
    objectionPrompt: "Murojaat bo'yicha e'tirozingiz sababini batafsil yozib yuboring:",
    objectionSubmitted: "E'tiroz qabul qilindi va qayta ko'rib chiqish uchun yuborildi.",
    
    // Rating flow
    rateScorePrompt: "Ushbu murojaat yechimini 5 ballik tizimda qanday baholaysiz? (1-5):",
    rateSolvedPrompt: "Muammo hal bo'ldimi? (Ha/Yo'q):",
    btnYes: "Ha",
    btnNo: "Yo'q",
    rateBehaviorPrompt: "Xodimning muomalasini baholang (1-5):",
    rateQualityPrompt: "Javob sifatini baholang (1-5):",
    rateSpeedPrompt: "Ko'rib chiqish tezligini baholang (1-5):",
    rateCommentPrompt: "Qo'shimcha fikr va mulohazalaringizni yozib yuboring (ixtiyoriy, skip qilish uchun xabar yuboring):",
    rateCompleted: "Baholashingiz qabul qilindi. Rahmat!",
    
    // Messaging
    appealChatTitle: "💬 *{num} raqamli murojaat bo'yicha suhbat*\n\nXodimlardan xabar yozishgacha to'g'ridan-to'g'ri shu yerda yozishishingiz mumkin.",
    chatClosed: "Suhbat yakunlangan. Xabar yuborish imkonsiz.",
    msgSent: "Xabaringiz xodimga yetkazildi.",
    
    // Tracking
    trackPrompt: "Murojaat raqamini kiriting (masalan, APL-2026-000145):",
    trackNotFound: "Ushbu raqamli murojaat topilmadi.",
    
    langSelect: "Iltimos, tilni tanlang / Пожалуйста, выберите язык / Please select language:",
    langChanged: "Muloqot tili o'zgartirildi."
  },
  ru: {
    welcome: "Здравствуйте! Добро пожаловать в Национальную систему обращений граждан!",
    registered: "Вы успешно зарегистрировались.",
    mainMenuTitle: "Выберите одну из услуг ниже:",
    btnNewAppeal: "📨 Новое обращение",
    btnMyAppeals: "📂 Мои обращения",
    btnTrackAppeal: "🔎 Отследить обращение",
    btnMessages: "💬 Сообщения",
    btnNotifications: "📢 Уведомления",
    btnRatings: "⭐ Мои оценки",
    btnSettings: "⚙ Настройки",
    btnHelp: "❓ Помощь",
    
    settingsTitle: "Изменить настройки:",
    btnLang: "🌐 Сменить язык",
    btnPhone: "📱 Обновить номер телефона",
    btnDeleteAcc: "❌ Удалить аккаунт",
    btnBack: "⬅ Назад",
    btnCancel: "❌ Отменить",
    
    phonePrompt: "Отправьте ваш номер телефона (нажмите кнопку):",
    btnSendPhone: "📱 Отправить номер",
    phoneUpdated: "Ваш номер телефона успешно сохранен!",
    
    helpText: "🏛 *Национальная система обращений*\n\nЧерез этого бота вы можете направлять официальные обращения в госорганы.\n\n📞 Горячая линия: 1148\n🌐 Веб-сайт: [portal.gov.uz](https://portal.gov.uz)\n🕒 Часы работы: Пн-Пт, 9:00 - 18:00\n\n_Ваше обращение будет рассмотрено в рамках закона._",
    
    stepChooseOrg: "1/5. Выберите организацию:\n(Можете отправить название организации для поиска)",
    stepChooseDep: "Выберите отдел:",
    stepChooseCat: "Выберите категорию обращения:",
    stepEnterSubject: "Введите тему обращения (макс. 150 символов):",
    stepEnterDesc: "2/5. Введите текст обращения (макс. 5000 символов):",
    stepUploadFiles: "3/5. Прикрепите файлы к обращению (фото, видео, документы). Нажмите 'Далее' после загрузки:",
    btnNext: "➡️ Далее",
    stepShareLocation: "4/5. Поделитесь местоположением (необязательно, GPS):",
    btnSkip: "⏭ Пропустить",
    stepPreview: "5/5. Подтвердите обращение:\n\n🏢 Организация: {org}\n📁 Отдел: {dep}\n🏷 Категория: {cat}\n📝 Тема: {subject}\n\n📄 Текст: {desc}\n📎 Файлов: {filesCount}\n📍 Локация: {location}",
    btnSubmit: "✅ Отправить",
    btnEdit: "✏️ Редактировать",
    
    appealSubmitted: "Обращение успешно отправлено!\n\n🔢 Номер обращения: *{num}*\nСтатус: *Отправлено*",
    appealSubmitFailed: "Ошибка при отправке. Пожалуйста, попробуйте еще раз.",
    
    myAppealsTitle: "Ваши обращения:",
    appealCard: "🔢 *Номер:* {num}\n📝 *Тема:* {subject}\n🏢 *Организация:* {org}\n🚦 *Статус:* {status}\n📅 *Дата:* {date}",
    noAppeals: "У вас пока нет обращений.",
    btnView: "👁 Посмотреть",
    
    statusReceived: "📥 Получено",
    statusAccepted: "✅ Принято",
    statusAssigned: "👤 Назначено",
    statusInProgress: "⚙ В процессе",
    statusWaitingReview: "🔎 Проверяется",
    statusCompleted: "🎉 Выполнено",
    statusRejected: "❌ Отклонено",
    statusReturned: "↩ Возвращено",
    statusClosed: "🔒 Закрыто",
    
    appealDetails: "📋 *Информация об обращении*\n\n🔢 Номер: {num}\n🚦 Статус: {status}\n🏢 Организация: {org}\n📁 Отдел: {dep}\n📝 Тема: {subject}\n📄 Текст: {desc}\n\n👤 Ответственный: {employee}\n📅 Дата: {date}",
    btnObjection: "⚠️ Подать возражение",
    btnRate: "⭐ Оценить",
    btnDownloadReport: "📥 Скачать отчет",
    
    objectionPrompt: "Подробно опишите причину вашего возражения:",
    objectionSubmitted: "Возражение принято и направлено на повторное рассмотрение.",
    
    rateScorePrompt: "Как вы оцениваете решение вопроса по 5-балльной шкале? (1-5):",
    rateSolvedPrompt: "Проблема была решена? (Да/Нет):",
    btnYes: "Да",
    btnNo: "Нет",
    rateBehaviorPrompt: "Оцените вежливость сотрудника (1-5):",
    rateQualityPrompt: "Оцените качество ответа (1-5):",
    rateSpeedPrompt: "Оцените скорость рассмотрения (1-5):",
    rateCommentPrompt: "Напишите ваши отзывы или комментарии (необязательно, отправьте сообщение для пропуска):",
    rateCompleted: "Ваша оценка принята. Спасибо!",
    
    appealChatTitle: "💬 *Чат по обращению {num}*\n\nВы можете общаться с исполнителем прямо здесь.",
    chatClosed: "Чат закрыт. Вы не можете отправлять сообщения.",
    msgSent: "Ваше сообщение доставлено исполнителю.",
    
    trackPrompt: "Введите номер обращения (например, APL-2026-000145):",
    trackNotFound: "Обращение с таким номером не найдено.",
    
    langSelect: "Выберите язык / Tilni tanlang / Please select language:",
    langChanged: "Язык интерфейса изменен."
  },
  en: {
    welcome: "Hello! Welcome to the National Citizen Appeal Management System!",
    registered: "You have successfully registered.",
    mainMenuTitle: "Select one of the services below:",
    btnNewAppeal: "📨 New Appeal",
    btnMyAppeals: "📂 My Appeals",
    btnTrackAppeal: "🔎 Track Appeal",
    btnMessages: "💬 Messages",
    btnNotifications: "📢 Notifications",
    btnRatings: "⭐ My Ratings",
    btnSettings: "⚙ Settings",
    btnHelp: "❓ Help",
    
    settingsTitle: "Change Settings:",
    btnLang: "🌐 Change Language",
    btnPhone: "📱 Update Phone Number",
    btnDeleteAcc: "❌ Delete Account",
    btnBack: "⬅ Back",
    btnCancel: "❌ Cancel",
    
    phonePrompt: "Share your phone number (click the button):",
    btnSendPhone: "📱 Send Phone Number",
    phoneUpdated: "Your phone number has been saved successfully!",
    
    helpText: "🏛 *National Appeal System*\n\nYou can submit official appeals to government bodies via this bot.\n\n📞 Hotline: 1148\n🌐 Website: [portal.gov.uz](https://portal.gov.uz)\n🕒 Working Hours: Mon-Fri, 9:00 - 18:00\n\n_Your appeal will be processed in accordance with the law._",
    
    stepChooseOrg: "1/5. Select Organization:\n(You can search by typing the name of organization)",
    stepChooseDep: "Select Department:",
    stepChooseCat: "Select Appeal Category:",
    stepEnterSubject: "Enter Appeal Subject (max 150 characters):",
    stepEnterDesc: "2/5. Enter Appeal Text (max 5000 characters):",
    stepUploadFiles: "3/5. Attach files (photo, video, document). Press 'Next' when finished:",
    btnNext: "➡️ Next",
    stepShareLocation: "4/5. Share Location (optional, GPS):",
    btnSkip: "⏭ Skip",
    stepPreview: "5/5. Confirm Appeal:\n\n🏢 Organization: {org}\n📁 Department: {dep}\n🏷 Category: {cat}\n📝 Subject: {subject}\n\n📄 Text: {desc}\n📎 Files: {filesCount}\n📍 Location: {location}",
    btnSubmit: "✅ Submit",
    btnEdit: "✏️ Edit",
    
    appealSubmitted: "Appeal submitted successfully!\n\n🔢 Appeal Number: *{num}*\nStatus: *Submitted*",
    appealSubmitFailed: "Error submitting appeal. Please try again.",
    
    myAppealsTitle: "Your appeals:",
    appealCard: "🔢 *Number:* {num}\n📝 *Subject:* {subject}\n🏢 *Organization:* {org}\n🚦 *Status:* {status}\n📅 *Date:* {date}",
    noAppeals: "You have no appeals yet.",
    btnView: "👁 View",
    
    statusReceived: "📥 Received",
    statusAccepted: "✅ Accepted",
    statusAssigned: "👤 Assigned",
    statusInProgress: "⚙ In Progress",
    statusWaitingReview: "🔎 Reviewing",
    statusCompleted: "🎉 Completed",
    statusRejected: "❌ Rejected",
    statusReturned: "↩ Returned",
    statusClosed: "🔒 Closed",
    
    appealDetails: "📋 *Appeal Details*\n\n🔢 Number: {num}\n🚦 Status: {status}\n🏢 Organization: {org}\n📁 Department: {dep}\n📝 Subject: {subject}\n📄 Text: {desc}\n\n👤 Employee: {employee}\n📅 Date: {date}",
    btnObjection: "⚠️ Submit Objection",
    btnRate: "⭐ Rate",
    btnDownloadReport: "📥 Download Report",
    
    objectionPrompt: "Write down the detailed reason of your objection:",
    objectionSubmitted: "Objection received and sent for re-examination.",
    
    rateScorePrompt: "How do you rate the solution from 1 to 5? (1-5):",
    rateSolvedPrompt: "Was the problem solved? (Yes/No):",
    btnYes: "Yes",
    btnNo: "No",
    rateBehaviorPrompt: "Rate the employee behavior (1-5):",
    rateQualityPrompt: "Rate the response quality (1-5):",
    rateSpeedPrompt: "Rate the speed of resolution (1-5):",
    rateCommentPrompt: "Leave your comments (optional, send message to skip):",
    rateCompleted: "Your rating has been received. Thank you!",
    
    appealChatTitle: "💬 *Chat on appeal {num}*\n\nYou can chat with the assigned employee directly here.",
    chatClosed: "Chat is closed. You cannot send messages.",
    msgSent: "Your message has been delivered to the employee.",
    
    trackPrompt: "Enter appeal number (e.g. APL-2026-000145):",
    trackNotFound: "Appeal with this number not found.",
    
    langSelect: "Select language / Tilni tanlang / Выберите язык:",
    langChanged: "Interface language updated."
  }
};

const getLocale = (lang) => {
  return locales[lang] || locales['uz'];
};

const getStatusBadge = (status, lang) => {
  const loc = getLocale(lang);
  switch (status) {
    case 'Received': return loc.statusReceived;
    case 'Accepted': return loc.statusAccepted;
    case 'Assigned': return loc.statusAssigned;
    case 'In Progress': return loc.statusInProgress;
    case 'Waiting Agency Review': return loc.statusWaitingReview;
    case 'Completed': return loc.statusCompleted;
    case 'Rejected': return loc.statusRejected;
    case 'Returned': return loc.statusReturned;
    case 'Closed': return loc.statusClosed;
    default: return status;
  }
};

module.exports = { getLocale, getStatusBadge };
