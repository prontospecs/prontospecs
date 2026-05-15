// ==========================================
// HR ADMIN PANEL | БРОНЕБОЙНАЯ ВЕРСИЯ
// ==========================================

const GAS_URL = "https://script.google.com/macros/s/AKfycbwW_QnQO2Wirs-2vSZ2NVDK5owjc0w7RDtf4czuDACtxyY245C1PuMMvo9mSbuPCYcbwA/exec"; 

window.BOT_VACANCIES = [];
window.BOT_QUESTIONS = [];
window.ADMIN_FIELDS = [
    { key: "menu_greeting", name: "Главное меню", ru: "Выберите:", uz: "Tanlang:" },
    { key: "about_text", name: "Текст 'О нас'", ru: "Информация...", uz: "Ma'lumot..." },
    { key: "success", name: "Успешная отправка", ru: "Отправлено!", uz: "Yuborildi!" }
];

async function syncAllData() {
    try {
        const response = await fetch(GAS_URL + "?t=" + new Date().getTime());
        if (!response.ok) throw new Error("Ошибка сети: " + response.status);
        const data = await response.json();
        
        if (data.vacancies) window.BOT_VACANCIES = data.vacancies;
        if (data.questions) window.BOT_QUESTIONS = data.questions;
        if (data.newTexts) {
            window.ADMIN_FIELDS.forEach(f => {
                if (data.newTexts[f.key + '_ru']) f.ru = data.newTexts[f.key + '_ru'];
                if (data.newTexts[f.key + '_uz']) f.uz = data.newTexts[f.key + '_uz'];
            });
        }
        navigate('home');
    } catch (e) {
        console.error("Ошибка синхронизации:", e);
        alert("⚠️ Данные не загрузились. Проверьте ссылку или интернет.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const s = JSON.parse(localStorage.getItem('pronto_settings') || '{}');
    if (s.username && s.role === 'admin') {
        syncAllData();
        navigate('home');
    } else {
        document.body.innerHTML = `
            <div style="text-align:center; margin-top:100px; font-family:sans-serif;">
                <h1 style="color:#ef4444;">⚠️ Доступ закрыт</h1>
                <p style="font-size:18px;">Вы не авторизованы. Войдите через главный экран.</p>
                <button onclick="window.location.href='../index.html'" style="margin-top:20px; padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:5px; cursor:pointer;">На главную</button>
            </div>
        `;
    }
});

function navigate(view) {
    const app = document.getElementById('app');
    if (view === 'home') app.innerHTML = homeView();
}

function homeView() {
    return `
    <div class="home-card fade-in" style="max-width: 900px; text-align: left;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 20px; align-items: center;">
            <h1 style="margin:0; color: var(--pronto);">HR ПАНЕЛЬ</h1>
            <div style="display:flex; gap:10px;">
                <button onclick="syncAllData()" class="btn-mini" style="background:#8b5cf6; color:white;">🔄 ОБНОВИТЬ</button>
                <button onclick="window.location.href='../index.html'" class="btn-mini" style="background:#64748b; color:white;">🔙 ВЫХОД</button>
            </div>
        </div>
        
        <div style="background: #e0f2fe; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3>💼 Вакансии</h3>
            <div id="vac_container">${buildVacanciesHTML()}</div>
            <button onclick="addVacancy()" class="btn-mini" style="background:#3b82f6; color:white;">➕ ДОБАВИТЬ</button>
        </div>

        <div style="background: #fef08a; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3>📋 Конструктор анкеты</h3>
            <div id="q_container">${buildQuestionsHTML()}</div>
            <button onclick="addQuestion()" class="btn-mini" style="background:#ca8a04; color:white;">➕ ДОБАВИТЬ ВОПРОС</button>
        </div>

        <div id="fields_container" style="background: #f8fafc; padding: 20px; border-radius: 15px;">
            <h3>📝 Основные тексты</h3>
            ${buildFieldsHTML()}
        </div>

        <button onclick="saveToBot()" id="saveBtn" class="btn" style="height:60px; margin-top:20px; width: 100%;">💾 СОХРАНИТЬ В ОБЛАКО</button>
    </div>
    `;
}

function buildVacanciesHTML() {
    if (window.BOT_VACANCIES.length === 0) return "<p style='color:gray;'>Нет данных.</p>";
    return window.BOT_VACANCIES.map(v => `
        <div style="background:white; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #93c5fd; position:relative;">
            <button onclick="removeVacancy(${v.id})" style="position:absolute; right:10px; top:10px; background:#ef4444; color:white; border:none; border-radius:5px;">🗑️</button>
            <input type="text" id="vac_name_ru_${v.id}" value="${v.name_ru}" oninput="saveStateSafe()" placeholder="Название (RU)" style="width:45%;">
            <input type="text" id="vac_name_uz_${v.id}" value="${v.name_uz}" oninput="saveStateSafe()" placeholder="Название (UZ)" style="width:45%;">
            <textarea id="vac_req_ru_${v.id}" oninput="saveStateSafe()" placeholder="Требования (RU)" style="width:45%; margin-top:5px; height:60px;">${v.req_ru}</textarea>
            <textarea id="vac_req_uz_${v.id}" oninput="saveStateSafe()" placeholder="Требования (UZ)" style="width:45%; margin-top:5px; height:60px;">${v.req_uz}</textarea>
        </div>
    `).join('');
}

function buildQuestionsHTML() {
    if (window.BOT_QUESTIONS.length === 0) return "<p style='color:gray;'>Анкета пуста.</p>";
    let opts = `<option value="">-- Обычно --</option><option value="end">🏁 Конец</option>`;
    window.BOT_QUESTIONS.forEach(t => { opts += `<option value="${t.id}">${t.name_ru}</option>`; });

    return window.BOT_QUESTIONS.map((q, i) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border:2px solid #eab308; position:relative;">
            <div style="position:absolute; right:10px; top:10px;">
                <button onclick="moveQuestion(${i}, -1)" class="btn-mini">⬆️</button>
                <button onclick="moveQuestion(${i}, 1)" class="btn-mini">⬇️</button>
                <button onclick="removeQuestion(${q.id})" class="btn-mini" style="background:#ef4444;">🗑️</button>
            </div>
            <b>В ${i+1}:</b> <input type="text" id="q_name_ru_${q.id}" value="${q.name_ru}" oninput="saveStateSafe()" style="width:150px;">
            <br>
            <input type="text" id="q_ru_${q.id}" value="${q.q_ru}" oninput="saveStateSafe()" placeholder="RU" style="width:48%;">
            <input type="text" id="q_uz_${q.id}" value="${q.q_uz}" oninput="saveStateSafe()" placeholder="UZ" style="width:48%;">
            <br>
            Тип: <select id="q_type_${q.id}" onchange="saveStateSafe(); refreshUI()">
                <option value="text" ${q.type==='text'?'selected':''}>Текст</option>
                <option value="buttons" ${q.type==='buttons'?'selected':''}>Кнопки</option>
            </select>
            ${q.type === 'buttons' ? `<input type="text" id="q_btn_ru_${q.id}" value="${q.buttons_ru}" oninput="saveStateSafe()" placeholder="Кнопки (Да, Нет)" style="width:40%;">` : ''}
            <div style="margin-top:5px; font-size:12px;">
                Логика: Если <input type="text" id="q_cond_ru_${q.id}" value="${q.cond_ru || ''}" oninput="saveStateSafe()" style="width:80px;"> ➡️
                <select id="q_cond_target_${q.id}" onchange="saveStateSafe()">
                    ${opts.replace(`value="${q.cond_target}"`, `value="${q.cond_target}" selected`)}
                </select>
            </div>
        </div>
    `).join('');
}

function buildFieldsHTML() {
    return window.ADMIN_FIELDS.map(f => `
        <div style="margin-bottom: 10px;">
            <label>${f.name}:</label>
            <div style="display:flex; gap:10px;">
                <input type="text" id="${f.key}_ru" value="${f.ru}" oninput="saveStateSafe()" style="flex:1;">
                <input type="text" id="${f.key}_uz" value="${f.uz}" oninput="saveStateSafe()" style="flex:1;">
            </div>
        </div>
    `).join('');
}

// 🔴 СУПЕР-БЕЗОПАСНОЕ СОХРАНЕНИЕ
function saveStateSafe() {
    try {
        if (!document.getElementById('vac_container')) return;
        
        window.BOT_VACANCIES.forEach(v => {
            v.name_ru = document.getElementById('vac_name_ru_'+v.id)?.value || v.name_ru;
            v.name_uz = document.getElementById('vac_name_uz_'+v.id)?.value || v.name_uz;
            v.req_ru = document.getElementById('vac_req_ru_'+v.id)?.value || v.req_ru;
            v.req_uz = document.getElementById('vac_req_uz_'+v.id)?.value || v.req_uz;
        });
        
        window.BOT_QUESTIONS.forEach(q => {
            q.name_ru = document.getElementById('q_name_ru_'+q.id)?.value || q.name_ru;
            q.q_ru = document.getElementById('q_ru_'+q.id)?.value || q.q_ru;
            q.q_uz = document.getElementById('q_uz_'+q.id)?.value || q.q_uz;
            q.type = document.getElementById('q_type_'+q.id)?.value || q.type;
            if(q.type === 'buttons') {
                q.buttons_ru = document.getElementById('q_btn_ru_'+q.id)?.value || q.buttons_ru || "";
            }
            q.cond_ru = document.getElementById('q_cond_ru_'+q.id)?.value || "";
            q.cond_target = document.getElementById('q_cond_target_'+q.id)?.value || "";
        });
        
        window.ADMIN_FIELDS.forEach(f => {
            f.ru = document.getElementById(f.key + '_ru')?.value || f.ru;
            f.uz = document.getElementById(f.key + '_uz')?.value || f.uz;
        });
    } catch(e) {
        console.error("Ошибка при чтении полей:", e);
    }
}

function refreshUI() {
    saveStateSafe();
    navigate('home');
}

async function saveToBot() {
    saveStateSafe();
    const btn = document.getElementById('saveBtn'); 
    btn.innerText = "⏳ СОХРАНЕНИЕ..."; 
    btn.disabled = true;
    
    let texts = {}; 
    window.ADMIN_FIELDS.forEach(f => { texts[f.key + '_ru'] = f.ru; texts[f.key + '_uz'] = f.uz; });
    
    const payload = { 
        adminPassword: "TimaSafeKey_2026", 
        newTexts: texts, 
        vacancies: window.BOT_VACANCIES, 
        questions: window.BOT_QUESTIONS 
    };
    
    try {
        const response = await fetch(GAS_URL, { 
            method: "POST", 
            body: JSON.stringify(payload), 
            headers: { "Content-Type": "text/plain" } 
        });
        
        const result = await response.text();
        
        if(result === "OK") {
            alert("✅ Успешно сохранено в облако!");
        } else {
            alert("⚠️ Сервер ответил, но возможно с ошибкой. Проверьте бота.");
        }
    } catch (error) {
        console.error("Ошибка при сохранении:", error);
        alert("❌ Ошибка соединения! Проверь интернет или настройки ссылки.");
    } finally {
        btn.innerText = "💾 СОХРАНИТЬ В ОБЛАКО";
        btn.disabled = false;
    }
}

function addVacancy() { window.BOT_VACANCIES.push({id: Date.now(), name_ru:"", name_uz:"", req_ru:"", req_uz:""}); refreshUI(); }
function removeVacancy(id) { window.BOT_VACANCIES = window.BOT_VACANCIES.filter(v => v.id !== id); refreshUI(); }
function addQuestion() { window.BOT_QUESTIONS.push({id: Date.now(), name_ru:"Новый", name_uz:"", q_ru:"", q_uz:"", type:"text", buttons_ru:"", cond_ru:"", cond_target:""}); refreshUI(); }
function removeQuestion(id) { window.BOT_QUESTIONS = window.BOT_QUESTIONS.filter(q => q.id !== id); refreshUI(); }
function moveQuestion(idx, dir) {
    if (idx + dir < 0 || idx + dir >= window.BOT_QUESTIONS.length) return;
    let temp = window.BOT_QUESTIONS[idx];
    window.BOT_QUESTIONS[idx] = window.BOT_QUESTIONS[idx + dir];
    window.BOT_QUESTIONS[idx + dir] = temp;
    refreshUI();
}
