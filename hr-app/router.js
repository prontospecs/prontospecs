// ==========================================
// HR ADMIN PANEL | DYNAMIC FORM BUILDER + LOGIC
// ==========================================

window.BOT_VACANCIES = [
    { id: 1, name_ru: "Менеджер", name_uz: "Menejer", req_ru: "Опыт...", req_uz: "Tajriba..." }
];

window.BOT_QUESTIONS = [
    { id: 1, name_ru: "ФИО", name_uz: "F.I.Sh", q_ru: "Введите ваше ФИО:", q_uz: "F.I.Sh kiriting:", type: "text", buttons_ru: "", buttons_uz: "", cond_ru: "", cond_uz: "", cond_target: "" },
    { id: 2, name_ru: "Студент", name_uz: "Talaba", q_ru: "Вы студент?", q_uz: "Talabamisiz?", type: "buttons", buttons_ru: "Да, Нет", buttons_uz: "Ha, Yo'q", cond_ru: "Нет", cond_uz: "Yo'q", cond_target: "end" },
    { id: 3, name_ru: "Форма обучения", name_uz: "Ta'lim shakli", q_ru: "Форма обучения:", q_uz: "Ta'lim shakli:", type: "buttons", buttons_ru: "Очно, Заочно", buttons_uz: "Kunduzgi, Sirtqi", cond_ru: "", cond_uz: "", cond_target: "" }
];

const ADMIN_FIELDS = [
    { key: "menu_greeting", name: "Главное меню", ru: "Выберите раздел:", uz: "Bo'limni tanlang:" },
    { key: "about_text", name: "Текст 'О нас'", ru: "Мы крутая компания!", uz: "Biz ajoyib kompaniyamiz!" },
    { key: "success", name: "Успешная отправка", ru: "Анкета отправлена!", uz: "Anketa yuborildi!" }
];

document.addEventListener("DOMContentLoaded", () => {
    try {
        const s = localStorage.getItem('pronto_settings');
        if (s && JSON.parse(s).username) return navigate('home');
    } catch(e) {}
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
        <h2 style="color:var(--pronto);">ВХОД В HR</h2>
        <input type="text" id="auth_login" placeholder="Логин">
        <input type="password" id="auth_pass" placeholder="Пароль">
        <button onclick="checkLogin()" class="btn">ВОЙТИ</button>
    </div>
`;

const homeView = () => {
    return `
    <div class="home-card fade-in" style="max-width: 900px; text-align: left;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
            <h1 style="margin:0; color: var(--pronto);">HR ПАНЕЛЬ</h1>
            <button onclick="logout()" class="btn-mini" style="background:#ef4444; color:white;">ВЫЙТИ</button>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-top:0;">💼 Вакансии</h3>
            <div id="vac_container">${buildVacanciesHTML()}</div>
            <button onclick="addVacancy()" class="btn-mini" style="background:#3b82f6; color:white; margin-top:10px;">➕ ДОБАВИТЬ ВАКАНСИЮ</button>
        </div>

        <div style="background: #fef08a; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="margin-top:0;">📋 Умный конструктор анкеты</h3>
            <div id="q_container">${buildQuestionsHTML()}</div>
            <button onclick="addQuestion()" class="btn-mini" style="background:#ca8a04; color:white; margin-top:10px;">➕ ДОБАВИТЬ ВОПРОС</button>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h3 style="margin-top:0;">📝 Основные тексты</h3>
            ${ADMIN_FIELDS.map(f => `
                <div style="margin-bottom: 10px;">
                    <label>${f.name} (RU / UZ):</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="${f.key}_ru" value="${f.ru}">
                        <input type="text" id="${f.key}_uz" value="${f.uz}">
                    </div>
                </div>
            `).join('')}
        </div>

        <button onclick="saveToBot()" id="saveBtn" class="btn" style="height:60px; font-size:18px; margin-top:20px;">💾 ОТПРАВИТЬ В БОТА</button>
    </div>
    `;
};

function buildVacanciesHTML() {
    return window.BOT_VACANCIES.map((v, i) => `
        <div style="background:white; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #93c5fd; position:relative;">
            <button onclick="removeVacancy(${v.id})" class="btn-mini" style="position:absolute; right:10px; top:10px; background:#ef4444; color:white;">🗑️</button>
            <input type="text" id="vac_name_ru_${v.id}" value="${v.name_ru}" placeholder="Название (RU)" style="margin-bottom:5px; width:45%;">
            <input type="text" id="vac_name_uz_${v.id}" value="${v.name_uz}" placeholder="Название (UZ)" style="margin-bottom:5px; width:45%;">
            <textarea id="vac_req_ru_${v.id}" placeholder="Условия (RU)" rows="2" style="width:45%; display:inline-block;">${v.req_ru}</textarea>
            <textarea id="vac_req_uz_${v.id}" placeholder="Условия (UZ)" rows="2" style="width:45%; display:inline-block;">${v.req_uz}</textarea>
        </div>
    `).join('');
}
function addVacancy() { saveState(); window.BOT_VACANCIES.push({id: Date.now(), name_ru:"", name_uz:"", req_ru:"", req_uz:""}); refreshUI(); }
function removeVacancy(id) { saveState(); window.BOT_VACANCIES = window.BOT_VACANCIES.filter(v => v.id !== id); refreshUI(); }

function buildQuestionsHTML() {
    // Собираем список всех вопросов для выпадающего списка
    let questionOptions = `<option value="">-- Следующий по списку (Обычно) --</option><option value="end">🏁 Сразу завершить анкету</option>`;
    window.BOT_QUESTIONS.forEach(targetQ => {
        questionOptions += `<option value="${targetQ.id}">Перейти к: ${targetQ.name_ru}</option>`;
    });

    return window.BOT_QUESTIONS.map((q, i) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border:2px solid #eab308; position:relative;">
            <div style="position:absolute; right:10px; top:10px; display:flex; gap:5px;">
                <button onclick="moveQuestion(${i}, -1)" class="btn-mini" style="background:#64748b; color:white;">⬆️</button>
                <button onclick="moveQuestion(${i}, 1)" class="btn-mini" style="background:#64748b; color:white;">⬇️</button>
                <button onclick="removeQuestion(${q.id})" class="btn-mini" style="background:#ef4444; color:white;">🗑️</button>
            </div>
            <b>Вопрос ${i+1}:</b> <input type="text" id="q_name_ru_${q.id}" value="${q.name_ru}" placeholder="Имя для вас (напр: Возраст)" style="width:200px; margin-bottom:5px;">
            <br>
            <input type="text" id="q_ru_${q.id}" value="${q.q_ru}" placeholder="Текст вопроса (RU)" style="width:48%;">
            <input type="text" id="q_uz_${q.id}" value="${q.q_uz}" placeholder="Текст вопроса (UZ)" style="width:48%;">
            <br>
            <select id="q_type_${q.id}" onchange="refreshUI()" style="padding:5px; margin-top:5px; margin-bottom:10px;">
                <option value="text" ${q.type==='text'?'selected':''}>Ответ текстом/фото</option>
                <option value="buttons" ${q.type==='buttons'?'selected':''}>Ответ кнопками</option>
            </select>
            ${q.type === 'buttons' ? `
                <div style="margin-bottom:10px;">
                    <input type="text" id="q_btn_ru_${q.id}" value="${q.buttons_ru}" placeholder="Кнопки (RU) через запятую: Да, Нет" style="width:48%;">
                    <input type="text" id="q_btn_uz_${q.id}" value="${q.buttons_uz}" placeholder="Кнопки (UZ) через запятую: Ha, Yo'q" style="width:48%;">
                </div>
            ` : ''}
            
            <div style="background:#f1f5f9; padding:10px; border-radius:6px; border: 1px dashed #94a3b8;">
                <b style="color:#475569; font-size:13px;">🔀 Логика ветвления (Условие перехода):</b><br>
                <div style="font-size:13px; margin-top:5px;">
                    Если ответ равен <input type="text" id="q_cond_ru_${q.id}" value="${q.cond_ru || ''}" placeholder="Слово RU (напр: Нет)" style="width:140px;">
                    или <input type="text" id="q_cond_uz_${q.id}" value="${q.cond_uz || ''}" placeholder="Слово UZ (напр: Yo'q)" style="width:140px;"> 
                    🡢
                    <select id="q_cond_target_${q.id}" style="padding:4px;">
                        ${questionOptions.replace(`value="${q.cond_target}"`, `value="${q.cond_target}" selected`)}
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

function moveQuestion(index, direction) {
    saveState();
    if (index + direction < 0 || index + direction >= window.BOT_QUESTIONS.length) return;
    let temp = window.BOT_QUESTIONS[index];
    window.BOT_QUESTIONS[index] = window.BOT_QUESTIONS[index + direction];
    window.BOT_QUESTIONS[index + direction] = temp;
    refreshUI();
}
function addQuestion() { saveState(); window.BOT_QUESTIONS.push({id: Date.now(), name_ru:"Новый", name_uz:"Yangi", q_ru:"?", q_uz:"?", type:"text", buttons_ru:"", buttons_uz:"", cond_ru:"", cond_uz:"", cond_target:""}); refreshUI(); }
function removeQuestion(id) { saveState(); window.BOT_QUESTIONS = window.BOT_QUESTIONS.filter(q => q.id !== id); refreshUI(); }

function saveState() {
    window.BOT_VACANCIES.forEach(v => {
        v.name_ru = document.getElementById('vac_name_ru_'+v.id)?.value || "";
        v.name_uz = document.getElementById('vac_name_uz_'+v.id)?.value || "";
        v.req_ru = document.getElementById('vac_req_ru_'+v.id)?.value || "";
        v.req_uz = document.getElementById('vac_req_uz_'+v.id)?.value || "";
    });
    window.BOT_QUESTIONS.forEach(q => {
        q.name_ru = document.getElementById('q_name_ru_'+q.id)?.value || "";
        q.q_ru = document.getElementById('q_ru_'+q.id)?.value || "";
        q.q_uz = document.getElementById('q_uz_'+q.id)?.value || "";
        q.type = document.getElementById('q_type_'+q.id)?.value || "text";
        if(q.type === 'buttons') {
            q.buttons_ru = document.getElementById('q_btn_ru_'+q.id)?.value || "";
            q.buttons_uz = document.getElementById('q_btn_uz_'+q.id)?.value || "";
        }
        q.cond_ru = document.getElementById('q_cond_ru_'+q.id)?.value || "";
        q.cond_uz = document.getElementById('q_cond_uz_'+q.id)?.value || "";
        q.cond_target = document.getElementById('q_cond_target_'+q.id)?.value || "";
    });
}
function refreshUI() {
    saveState();
    document.getElementById('vac_container').innerHTML = buildVacanciesHTML();
    document.getElementById('q_container').innerHTML = buildQuestionsHTML();
}

function checkLogin() {
    const login = document.getElementById('auth_login').value.trim();
    const pass = document.getElementById('auth_pass').value.trim();
    if (login === 'admin' && pass === '123') { 
        localStorage.setItem('pronto_settings', JSON.stringify({ role: 'admin', username: 'SuperAdmin' }));
        return navigate('home'); 
    }
}
function logout() { localStorage.removeItem('pronto_settings'); navigate('login'); }

function saveToBot() {
    saveState();
    const btn = document.getElementById('saveBtn'); btn.innerText = "⏳ ОТПРАВКА..."; btn.disabled = true;

    let updatedTexts = {};
    ADMIN_FIELDS.forEach(f => {
        updatedTexts[f.key + '_ru'] = document.getElementById(f.key + '_ru')?.value || "";
        updatedTexts[f.key + '_uz'] = document.getElementById(f.key + '_uz')?.value || "";
    });

    const payload = {
        adminPassword: "TimurSuperAdmin123", 
        newTexts: updatedTexts,
        vacancies: window.BOT_VACANCIES,
        questions: window.BOT_QUESTIONS
    };

    const GAS_URL = "https://script.google.com/macros/s/AKfycbzEHSCuchjeLD6IzBtUgy3_wTI21fM9-V5EtJRNzJGiDqGHmv3Bc0KWE4GqG4awJKWWew/exec"; // <--- НЕ ЗАБУДЬ ВСТАВИТЬ ССЫЛКУ

    fetch(GAS_URL, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "text/plain;charset=utf-8" } })
    .then(r => r.text()).then(r => { alert("✅ Успешно!"); btn.innerText = "💾 ОТПРАВИТЬ В БОТА"; btn.disabled = false; })
    .catch(e => { alert("❌ Ошибка: " + e); btn.innerText = "💾 ОТПРАВИТЬ В БОТА"; btn.disabled = false; });
}
