// ==========================================
// HR ADMIN PANEL | SMART ROUTING
// ==========================================

// 💡 УМНЫЙ СПИСОК ВСЕХ ТЕКСТОВ БОТА
// Чтобы добавить новый текст, просто скопируй любую строчку, поменяй 'key' (например, "new_q") и впиши свои тексты.
const ADMIN_FIELDS = [
    { key: "menu_greeting", name: "Приветствие в главном меню", type: "textarea", ru: "Приветствуем! Выберите нужный раздел:", uz: "Xush kelibsiz! Kerakli bo'limni tanlang:" },
    { key: "about_text", name: "Раздел 'О нас'", type: "textarea", ru: "Мы — крутая компания!", uz: "Biz — ajoyib kompaniyamiz!" },
    { key: "vacancy_q", name: "Вопрос: Выбор вакансии", type: "input", ru: "На какую профессию вы претендуете?", uz: "Qaysi kasbga da'vogarlik qilyapsiz?" },
    { key: "vacancy_info", name: "Требования по вакансии", type: "textarea", ru: "Требования и условия по выбранной профессии...", uz: "Tanlangan kasb bo'yicha talablar va shartlar..." },
    { key: "fio_q", name: "Вопрос: ФИО", type: "input", ru: "Введите ваше ФИО (по паспорту):", uz: "F.I.Sh. ni kiriting (pasport bo'yicha):" },
    { key: "birth_q", name: "Вопрос: Дата рождения", type: "input", ru: "Введите вашу дату рождения:", uz: "Tug'ilgan sanangizni kiriting:" },
    { key: "location_q", name: "Вопрос: Место проживания", type: "input", ru: "Введите ваше место проживания:", uz: "Yashash joyingizni kiriting:" },
    { key: "phone_q", name: "Вопрос: Телефон", type: "input", ru: "Введите ваш номер телефона:", uz: "Telefon raqamingizni kiriting:" },
    { key: "gender_q", name: "Вопрос: Пол", type: "input", ru: "Укажите ваш пол:", uz: "Jinsingizni ko'rsating:" },
    { key: "student_q", name: "Вопрос: Студент", type: "input", ru: "Вы являетесь студентом?", uz: "Talabamisiz?" },
    { key: "exp_q", name: "Вопрос: Опыт работы", type: "textarea", ru: "Опишите ваш опыт работы (компания, срок, должность)...", uz: "Ish tajribangizni tasvirlab bering..." },
    { key: "salary_q", name: "Вопрос: Зарплата", type: "input", ru: "Укажите ожидаемый уровень зарплаты (в сумах):", uz: "Kutilayotgan ish haqi miqdorini ko'rsating (so'mda):" },
    { key: "photo_q", name: "Вопрос: Фото", type: "textarea", ru: "Пожалуйста, отправьте ваше фото (прикрепите как картинку):", uz: "Iltimos, rasmingizni yuboring (rasm sifatida biriktiring):" },
    { key: "source_q", name: "Вопрос: Откуда узнали", type: "input", ru: "Как вы узнали о нашей вакансии?", uz: "Vakansiyamiz haqida qayerdan bildingiz?" },
    { key: "confirm_q", name: "Текст: Проверка ответов", type: "textarea", ru: "📝 Пожалуйста, проверьте ваши ответы:\n\n", uz: "📝 Iltimos, javoblaringizni tekshiring:\n\n" },
    { key: "success", name: "Текст: Успешная отправка", type: "textarea", ru: "Анкета успешно отправлена! Скоро мы свяжемся с вами.", uz: "Anketa muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz." }
];

document.addEventListener("DOMContentLoaded", () => {
    const settings = localStorage.getItem('pronto_settings');
    if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.username) {
            navigate('home'); 
            return;
        }
    }
    navigate('login');
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
    
    // МАГИЯ ГЕНЕРАЦИИ ПОЛЕЙ ИЗ СПИСКА
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

    // Умный сборщик: сам собирает данные со всех полей списка ADMIN_FIELDS
    let updatedTexts = {};
    ADMIN_FIELDS.forEach(f => {
        updatedTexts[f.key + '_ru'] = document.getElementById(f.key + '_ru').value;
        updatedTexts[f.key + '_uz'] = document.getElementById(f.key + '_uz').value;
    });

    const payload = {
        adminPassword: "TimurSuperAdmin123", 
        newTexts: updatedTexts
    };

    // ⚠️ ВАЖНО: ССЫЛКА НА ТВОЙ GOOGLE APPS SCRIPT
    const GAS_URL = "ТВОЯ_ТЕКУЩАЯ_ССЫЛКА_WEB_APP_ОТ_ГУГЛА"; 

    if (GAS_URL.includes("ТВОЯ_ТЕКУЩАЯ_ССЫЛКА")) {
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
