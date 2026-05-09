// ==========================================
// HR ADMIN PANEL | LOGIN & ROUTING
// ==========================================

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
    return `
    <div class="home-card fade-in" style="max-width: 800px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 30px;">
            <div style="text-align: left;">
                <h1 style="margin:0; font-size: 32px; color: var(--pronto);">HUMAN RESOURCES</h1>
                <p style="margin:0; color:#64748b; font-weight:bold;">Управление ботом | Пользователь: ${s.username || 'Admin'}</p>
            </div>
            <button onclick="logout()" class="btn-mini" style="background: #ef4444; color: white;">ВЫЙТИ</button>
        </div>
        
        <div style="text-align: left; background: #f8fafc; padding: 25px; border-radius: 15px; border: 2px solid #cbd5e1;">
            <h3 style="margin-top:0; color:var(--text);">📝 Тексты для бота</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <label>🇷🇺 Текст "О нас" (Русский):</label>
                    <textarea id="about_ru" rows="3">Мы — крутая компания!</textarea>
                </div>
                <div>
                    <label>🇺🇿 Текст "О нас" (Узбекский):</label>
                    <textarea id="about_uz" rows="3">Biz — ajoyib kompaniyamiz!</textarea>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px;">
                <div>
                    <label>🇷🇺 Условия вакансии (Русский):</label>
                    <textarea id="vacancy_ru" rows="4">Требования и условия:\n- Требование 1\n- Условие 1</textarea>
                </div>
                <div>
                    <label>🇺🇿 Условия вакансии (Узбекский):</label>
                    <textarea id="vacancy_uz" rows="4">Tanlangan kasb bo'yicha talablar:\n- 1-talab\n- 1-shart</textarea>
                </div>
            </div>

            <button onclick="saveToBot()" id="saveBtn" class="btn" style="height: 50px; font-size: 16px;">💾 СОХРАНИТЬ И ОТПРАВИТЬ В ТЕЛЕГРАМ</button>
        </div>
    </div>
    `;
};

// --- ФУНКЦИИ ВХОДА (Используют общую базу из config.js) ---
function checkLogin() {
    const login = document.getElementById('auth_login').value.trim();
    const pass = document.getElementById('auth_pass').value.trim();
    if (login === '' || pass === '') return alert("Введите логин и пароль!");

    // У тебя в конфиге задан системный админ:
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

// --- ФУНКЦИЯ ОТПРАВКИ НАСТРОЕК БОТУ ---
function saveToBot() {
    const btn = document.getElementById('saveBtn');
    btn.innerText = "⏳ ОТПРАВКА ДАННЫХ...";
    btn.disabled = true;

    // Собираем то, что заказчик написал в полях
    const updatedTexts = {
        about_ru: document.getElementById('about_ru').value,
        about_uz: document.getElementById('about_uz').value,
        vacancy_ru: document.getElementById('vacancy_ru').value,
        vacancy_uz: document.getElementById('vacancy_uz').value
    };

    const payload = {
        adminPassword: "TimurSuperAdmin123", // Пароль-защита для бота
        newTexts: updatedTexts
    };

    // ⚠️ ВАЖНО: СЮДА НУЖНО БУДЕТ ВСТАВИТЬ ССЫЛКУ НА РАЗВЕРТЫВАНИЕ GOOGLE APPS SCRIPT
    const GAS_URL = "ТВОЯ_ТЕКУЩАЯ_ССЫЛКА_WEB_APP_ОТ_ГУГЛА"; 

    if (GAS_URL.includes("ТВОЯ_ТЕКУЩАЯ_ССЫЛКА")) {
        alert("⚠️ Внимание: Кнопка пока работает в демо-режиме.\nЧтобы данные улетели в Телеграм, нужно вставить Web App ссылку Гугла в код router.js!");
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
