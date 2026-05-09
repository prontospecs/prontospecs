// ==========================================
// HR ADMIN PANEL | SMART ROUTING
// ==========================================

// 💡 ПОЛНЫЙ СПИСОК ВСЕХ ТЕКСТОВ И КНОПОК
const ADMIN_FIELDS = [
    // --- ПРИВЕТСТВИЯ И МЕНЮ ---
    { key: "menu_greeting", name: "Приветствие в главном меню", type: "textarea", ru: "Приветствуем! Выберите нужный раздел:", uz: "Xush kelibsiz! Kerakli bo'limni tanlang:" },
    { key: "about_text", name: "Текст 'О нас'", type: "textarea", ru: "Мы — крутая компания!", uz: "Biz — ajoyib kompaniyamiz!" },
    
    // --- ГЛАВНЫЕ КНОПКИ МЕНЮ ---
    { key: "btn_about", name: "Кнопка 'О нас'", type: "input", ru: "О нас", uz: "Biz haqimizda" },
    { key: "btn_vacancies", name: "Кнопка 'Вакансии'", type: "input", ru: "Вакансии", uz: "Vakansiyalar" },
    { key: "btn_lang", name: "Кнопка 'Язык'", type: "input", ru: "Язык / Til", uz: "Til / Язык" },

    // --- ВОПРОСЫ АНКЕТЫ ---
    { key: "vacancy_q", name: "Вопрос: Выбор вакансии", type: "input", ru: "На какую профессию вы претендуете?", uz: "Qaysi kasbga da'vogarlik qilyapsiz?" },
    { key: "vacancy_info", name: "Текст: Условия вакансии", type: "textarea", ru: "Требования и условия по выбранной профессии:\n- Требование 1\n- Условие 1\n\nГотовы откликнуться?", uz: "Tanlangan kasb bo'yicha talablar va shartlar:\n- 1-talab\n- 1-shart\n\nAriza topshirishga tayyormisiz?" },
    { key: "btn_fill_form", name: "Кнопка 'Заполнить анкету'", type: "input", ru: "Заполнить анкету", uz: "Anketani to'ldirish" },
    { key: "fio_q", name: "Вопрос: ФИО", type: "input", ru: "Введите ваше ФИО (по паспорту):", uz: "F.I.Sh. ni kiriting (pasport bo'yicha):" },
    { key: "birth_q", name: "Вопрос: Дата рождения", type: "input", ru: "Введите вашу дату рождения:", uz: "Tug'ilgan sanangizni kiriting:" },
    { key: "location_q", name: "Вопрос: Место проживания", type: "input", ru: "Введите ваше место проживания:", uz: "Yashash joyingizni kiriting:" },
    { key: "phone_q", name: "Вопрос: Телефон", type: "input", ru: "Введите ваш номер телефона:", uz: "Telefon raqamingizni kiriting:" },
    { key: "gender_q", name: "Вопрос: Пол", type: "input", ru: "Укажите ваш пол:", uz: "Jinsingizni ko'rsating:" },
    { key: "marital_q", name: "Вопрос: Семейное положение", type: "input", ru: "Ваше семейное положение:", uz: "Oilaviy ahvolingiz:" },
    { key: "student_q", name: "Вопрос: Студент", type: "input", ru: "Вы являетесь студентом?", uz: "Talabamisiz?" },
    { key: "student_mode_q", name: "Вопрос: Форма обучения", type: "input", ru: "Форма обучения:", uz: "Ta'lim shakli:" },
    { key: "student_time_q", name: "Вопрос: Время обучения", type: "input", ru: "Время обучения:", uz: "O'qish vaqti:" },
    { key: "exp_q", name: "Вопрос: Опыт работы", type: "textarea", ru: "Опишите ваш опыт работы (компания, срок, должность). Если опыта нет, напишите 'Нет опыта':", uz: "Ish tajribangizni tasvirlab bering (kompaniya, muddat, lavozim). Agar tajribangiz bo'lmasa, 'Tajriba yo'q' deb yozing:" },
    { key: "lang_uz_q", name: "Вопрос: Уровень Узбекского", type: "input", ru: "Уровень Узбекского языка:", uz: "O'zbek tilini bilish darajasi:" },
    { key: "lang_en_q", name: "Вопрос: Уровень Английского", type: "input", ru: "Уровень Английского языка:", uz: "Ingliz tilini bilish darajasi:" },
    { key: "lang_ru_q", name: "Вопрос: Уровень Русского", type: "input", ru: "Уровень Русского языка:", uz: "Rus tilini bilish darajasi:" },
    { key: "salary_q", name: "Вопрос: Зарплата", type: "input", ru: "Укажите ожидаемый уровень зарплаты (в сумах):", uz: "Kutilayotgan ish haqi miqdorini ko'rsating (so'mda):" },
    { key: "photo_q", name: "Вопрос: Фото", type: "textarea", ru: "Пожалуйста, отправьте ваше фото (прикрепите как картинку):", uz: "Iltimos, rasmingizni yuboring (rasm sifatida biriktiring):" },
    { key: "source_q", name: "Вопрос: Откуда узнали", type: "input", ru: "Как вы узнали о нашей вакансии?", uz: "Vakansiyamiz haqida qayerdan bildingiz?" },
    { key: "confirm_q", name: "Текст: Проверка ответов", type: "textarea", ru: "📝 Пожалуйста, проверьте ваши ответы:\n\n", uz: "📝 Iltimos, javoblaringizni tekshiring:\n\n" },
    { key: "confirm_ask", name: "Текст: Подтверждение отправки", type: "input", ru: "Всё верно? Отправляем анкету?", uz: "Barchasi to'g'rimi? Anketani yuboramizmi?" },
    { key: "success", name: "Текст: Успешная отправка", type: "textarea", ru: "Анкета успешно отправлена! Скоро мы свяжемся с вами.", uz: "Anketa muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz." },

    // --- КНОПКИ ДЕЙСТВИЙ И ОТВЕТОВ ---
    { key: "btn_yes", name: "Кнопка 'Да'", type: "input", ru: "Да", uz: "Ha" },
    { key: "btn_no", name: "Кнопка 'Нет'", type: "input", ru: "Нет", uz: "Yo'q" },
    { key: "btn_male", name: "Кнопка 'Муж'", type: "input", ru: "Муж", uz: "Erkak" },
    { key: "btn_female", name: "Кнопка 'Жен'", type: "input", ru: "Жен", uz: "Ayol" },
    { key: "btn_married", name: "Кнопка 'Женат/Замужем'", type: "input", ru: "Женат/Замужем", uz: "Uylangan/Turmushga chiqqan" },
    { key: "btn_single", name: "Кнопка 'Холост/Не замужем'", type: "input", ru: "Холост/Не замужем", uz: "Bo'ydoq/Turmushga chiqmagan" },
    { key: "btn_fulltime", name: "Кнопка 'Очно'", type: "input", ru: "Очно", uz: "Kunduzgi" },
    { key: "btn_parttime", name: "Кнопка 'Заочно'", type: "input", ru: "Заочно", uz: "Sirtqi" },
    { key: "btn_morning", name: "Кнопка 'Утреннее'", type: "input", ru: "Утреннее", uz: "Ertalabki" },
    { key: "btn_evening", name: "Кнопка 'Вечернее'", type: "input", ru: "Вечернее", uz: "Kechki" },
    { key: "btn_low", name: "Кнопка 'Низкий уровень'", type: "input", ru: "Низкий (не понимаю)", uz: "Past (tushunmayman)" },
    { key: "btn_mid", name: "Кнопка 'Средний уровень'", type: "input", ru: "Средний (понимаю, не говорю)", uz: "O'rta (tushunaman, gapirmayman)" },
    { key: "btn_high", name: "Кнопка 'Продвинутый уровень'", type: "input", ru: "Продвинутый (свободно)", uz: "Yuqori (erkin)" },
    { key: "btn_skip", name: "Кнопка 'Пропустить'", type: "input", ru: "Пропустить", uz: "O'tkazib yuborish" },
    { key: "btn_send", name: "Кнопка 'Отправить'", type: "input", ru: "✅ Отправить", uz: "✅ Yuborish" },
    { key: "btn_back", name: "Кнопка 'Назад'", type: "input", ru: "🔙 Назад", uz: "🔙 Orqaga" },
    { key: "btn_main", name: "Кнопка 'Главное меню'", type: "input", ru: "🏠 Главное меню", uz: "🏠 Asosiy menyu" }
];

document.addEventListener("DOMContentLoaded", () => {
    try {
        const settings = localStorage.getItem('pronto_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            if (parsed.username) {
                navigate('home'); 
                return;
            }
        }
        navigate('login');
    } catch(e) {
        navigate('login');
    }
});

function navigate(view) {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = ''; 
    if (view === 'login') app.innerHTML = loginView();
    else if (view === 'home') app.innerHTML = homeView();
}

const loginView = () => `
    <div class="home-card fade-in" style="max-width: 400px; margin-top: 10vh; text-align: center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
            <button onclick="window.location.href='../index.html'" class="btn-mini">🡠 На портал</button>
            <h2 style="margin:0; color:var(--pronto);">ВХОД В HR</h2>
            <div style="width:80px;"></div>
        </div>
        <div style="text-align: left;">
            <label>ЛОГИН:</label>
            <input type="text" id="auth_login" placeholder="Ваш логин">
            <label>ПАРОЛЬ:</label>
            <input type="password" id="auth_pass" placeholder="Ваш пароль">
            <button onclick="checkLogin()" class="btn">ВОЙТИ</button>
        </div>
    </div>
`;

const homeView = () => {
    const s = JSON.parse(localStorage.getItem('pronto_settings') || '{}');
    
    // Генерируем карточки для всех полей из массива ADMIN_FIELDS
    let fieldsHTML = '';
    ADMIN_FIELDS.forEach(f => {
        fieldsHTML += `
        <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h4 style="margin-top: 0; margin-bottom: 15px; color: var(--pronto); font-size: 16px;">✏️ ${f.name}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label>🇷🇺 Русский:</label>
                    ${f.type === 'textarea' 
                        ? `<textarea id="${f.key}_ru" rows="3">${f.ru}</textarea>` 
                        : `<input type="text" id="${f.key}_ru" value="${f.ru}">`}
                </div>
                <div>
                    <label>🇺🇿 Узбекский:</label>
                    ${f.type === 'textarea' 
                        ? `<textarea id="${f.key}_uz" rows="3">${f.uz}</textarea>` 
                        : `<input type="text" id="${f.key}_uz" value="${f.uz}">`}
                </div>
            </div>
        </div>`;
    });

    return `
    <div class="home-card fade-in" style="max-width: 900px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
            <div style="text-align: left;">
                <h1 style="margin:0; font-size: 32px; color: var(--pronto);">HUMAN RESOURCES</h1>
                <p style="margin:0; color:#64748b; font-weight:bold;">Управление ботом | Пользователь: ${s.username || 'Admin'}</p>
            </div>
            <button onclick="logout()" class="btn-mini" style="background: #ef4444; color: white;">ВЫЙТИ</button>
        </div>
        
        <div style="text-align: left; background: #f8fafc; padding: 30px; border-radius: 15px; border: 2px solid #cbd5e1;">
            <h3 style="margin-top:0; color:var(--text); margin-bottom: 20px;">📝 Настройка текстов и вопросов бота</h3>
            
            ${fieldsHTML}

            <button onclick="saveToBot()" id="saveBtn" class="btn" style="height: 60px; font-size: 18px; margin-top: 10px;">💾 СОХРАНИТЬ И ОТПРАВИТЬ В ТЕЛЕГРАМ</button>
        </div>
    </div>
    `;
};

function checkLogin() {
    const login = document.getElementById('auth_login').value.trim();
    const pass = document.getElementById('auth_pass').value.trim();
    if (login === '' || pass === '') return alert("Введите логин и пароль!");

    if (typeof APP_CONFIG !== 'undefined' && login === APP_CONFIG.adminLogin && pass === APP_CONFIG.adminPassword) {
        localStorage.setItem('pronto_settings', JSON.stringify({ role: 'admin', username: 'SuperAdmin' }));
        return navigate('home'); 
    }

    if (typeof db === 'undefined') return alert("Ошибка: База данных Firebase не подключена.");

    // Безопасное экранирование логина
    const safeLogin = login.replace(/[.#$\\[\\]]/g, '_');
    
    db.ref('users/' + safeLogin).once('value').then((snapshot) => {
        if (!snapshot.exists()) return alert("Такого пользователя не существует!");
        const user = snapshot.val();
        if (user.password !== pass) return alert("Неверный пароль!");
        if (user.status !== 'approved' && user.role !== 'admin') return alert("Ваш аккаунт еще не одобрен!");

        localStorage.setItem('pronto_settings', JSON.stringify({ role: user.role, username: safeLogin }));
        navigate('home'); 
    }).catch((err) => alert("Ошибка при входе: " + err.message));
}

function logout() {
    localStorage.removeItem('pronto_settings');
    navigate('login');
}

function saveToBot() {
    const btn = document.getElementById('saveBtn');
    btn.innerText = "⏳ ОТПРАВКА ДАННЫХ...";
    btn.disabled = true;

    let updatedTexts = {};
    
    // Собираем данные со всех полей
    ADMIN_FIELDS.forEach(f => {
        let ruEl = document.getElementById(f.key + '_ru');
        let uzEl = document.getElementById(f.key + '_uz');
        if(ruEl) updatedTexts[f.key + '_ru'] = ruEl.value;
        if(uzEl) updatedTexts[f.key + '_uz'] = uzEl.value;
    });

    const payload = {
        adminPassword: "TimurSuperAdmin123", 
        newTexts: updatedTexts
    };

    // ⚠️ СЮДА ВСТАВИШЬ ССЫЛКУ ОТ ГУГЛ СКРИПТА
    const GAS_URL = "Тhttps://script.google.com/macros/s/AKfycbzEHSCuchjeLD6IzBtUgy3_wTI21fM9-V5EtJRNzJGiDqGHmv3Bc0KWE4GqG4awJKWWew/exec"; 

    if (GAS_URL.includes("https://script.google.com/macros/s/AKfycbzEHSCuchjeLD6IzBtUgy3_wTI21fM9-V5EtJRNzJGiDqGHmv3Bc0KWE4GqG4awJKWWew/exec")) {
        alert("⚠️ Внимание: Кнопка в демо-режиме.\nВставь Web App ссылку Гугла в код router.js (строка GAS_URL)!");
        btn.innerText = "💾 СОХРАНИТЬ И ОТПРАВИТЬ В ТЕЛЕГРАМ";
        btn.disabled = false;
        return;
    }

    fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(response => response.text())
    .then(result => {
        alert("✅ Ура! Тексты успешно обновлены в боте!");
        btn.innerText = "💾 СОХРАНИТЬ И ОТПРАВИТЬ В ТЕЛЕГРАМ";
        btn.disabled = false;
    })
    .catch(error => {
        alert("❌ Ошибка при соединении с ботом: " + error);
        btn.innerText = "💾 СОХРАНИТЬ И ОТПРАВИТЬ В ТЕЛЕГРАМ";
        btn.disabled = false;
    });
}
